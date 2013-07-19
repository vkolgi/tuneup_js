#import "assertions.js"
#import "lang-ext.js"

extend(UIATableView.prototype, {
  /**
   * A shortcut for:
   *  this.cells().firstWithName(name)
   */
  cellNamed: function(name) {
    return this.cells().firstWithName(name);
  },

  /**
   * Asserts that this table has a cell with the name (accessibility label)
   * matching the given +name+ argument.
   */
  assertCellNamed: function(name) {
    assertNotNull(this.cellNamed(name), "No table cell found named '" + name + "'");
  }
});

extend(UIAElement.prototype, {
	/**
	 * Dump tree in json format for copy/paste use in AssertWindow and friends
	 */

	elementJSONDump: function (recursive, attributes, visibleOnly) {
        if (visibleOnly && !this.isVisible())
        {
            return "";
        }

        if (!attributes)
        {
            attributes = ["name", "label", "value", "isVisible"];
        }
        else if (attributes == 'ALL')
        {
            attributes = ["name", "label", "value"].concat(
                this.getMethods().filter(function(method) { return method.match(/^(is|has)/) })
            );
        }

        var jsonStr = "";
        attributes.forEach(function(attr)
        {
            try {
                var value = this[attr]();
                if (value != null) //don't print null values
                {
                    var valueType = typeof(value);
                    //quote strings and numbers.  true/false unquoted.
                    if (valueType == "string"
                        || valueType == "number")
                    {
                        value = "'" + value + "'";
                    }
                    jsonStr += attr + ': ' + value + ',\n';
                }
            } catch (e) { }
        }, this);

        if (recursive)
        {
            var children = this.elements().toArray();
            if (children.length > 0)
            {
                var curType = null;
                children.sort().forEach(function(child)
                {
                    function elementTypeToUIAGetter(elementType, parent)
                    {
                        //almost all types follow a simple name to getter convention.
                        //UIAImage => images.  UIAWindow => windows.
                        var getter = elementType.substring(3).lcfirst() + 's';
                        if (elementType == "UIACollectionCell"
                            || elementType == "UIATableCell")
                        {
                            getter = "cells";
                        }
                        if (parent && !eval('parent.' + getter))
                        {
                            //Note: we can't use introspection to list valid methods on the parents
                            //because they are all "native" methods and aren't visible.
                            //so the valid getter must be looked up in the documentation and mapped above
                            UIALogger.logError("elementTypeToUIAGetter could not determine getter for "
                                + elementType);
                        }
                        return elementType.substring(3).lcfirst() + 's';
                    }

                    var objType = Object.prototype.toString.call(child);  //[object UIAWindow]
                    objType = objType.substring(8, objType.length-1);    //UIAWindow
                    // there's a bug that causes leaf elements to have child references
                    // back up to UIAApplication, thus the check for that
                    // this means we can't dump from the "target" level - only mainWindow and below
                    // hopefully this bug goes away 2013-07-02
                    if (objType == "UIAApplication"
                        || objType == "UIAElementNil"
                        || (visibleOnly && !child.isVisible())
                        )
                    {
                        //skip this child
                        return;
                    }

                    if (objType == "UIACollectionCell"
                        && !this.isVisible())
                    {
                        //elements() shows invisible cells that cells() does not
                        return;
                    }
                    if (curType && curType != objType)
                    {
                        //close off open list
                        jsonStr += "],\n";
                    }
                    if (!curType || curType != objType)
                    {
                        curType = objType;
                        //open a new list
                        jsonStr += elementTypeToUIAGetter(objType, this) + ": [\n";
                    }

                    var childJsonStr = child.elementJSONDump(true, attributes, visibleOnly);
                    if (childJsonStr)
                    {
                        jsonStr += "{\n";
                        jsonStr += childJsonStr.replace(/^/gm, "    ").replace(/    $/, '');
                        jsonStr += "},\n";
                    } else {
                        //child has no attributes to report (all null)
                        jsonStr += "    null,\n";
                    }

                }, this);
                if (curType)
                {
                    //close off open list
                    jsonStr += "],\n";
                }
            }
        }

        return jsonStr;
	},

	logElementJSON: function (attributes) {
        //TODO dump the path to the object in the debug line
        //ex: target.frontMostApp().mainWindow().toolbars()[0].buttons()["Library"]
        UIALogger.logDebug("logElementJSON: "
                + (attributes ? "[" + attributes + "]" : '')
                + "\n" + this.elementJSONDump(false, attributes));
    },

	logVisibleElementJSON: function (attributes) {
        //TODO dump the path to the object in the debug line
        //ex: target.frontMostApp().mainWindow().toolbars()[0].buttons()["Library"]
        UIALogger.logDebug("logVisibleElementJSON: "
                + (attributes ? "[" + attributes + "]" : '')
                + "\n" + this.elementJSONDump(false, attributes, true));
    },

	logElementTreeJSON: function (attributes) {
        UIALogger.logDebug("logElementTreeJSON: "
                + (attributes ? "[" + attributes + "]" : '')
                + "\n" + this.elementJSONDump(true, attributes));
    },

	logVisibleElementTreeJSON: function (attributes) {
        UIALogger.logDebug("logVisibleElementTreeJSON: "
                + (attributes ? "[" + attributes + "]" : '')
                + "\n" + this.elementJSONDump(true, attributes, true));
    },

	/**
	 * Poll till the item becomes visible, up to a specified timeout
	 */
	waitUntilVisible: function (timeoutInSeconds) {
        this.waitUntil(function(element) {
            return element;
        }, function(element) {
            return element.isVisible();
        }, timeoutInSeconds, "to become visible");
	},

	/**
	 * Wait until element becomes invisible
	 */
	waitUntilInvisible: function (timeoutInSeconds) {
        this.waitUntil(function(element) {
            return element;
        }, function(element) {
            return !element.isVisible();
        }, timeoutInSeconds, "to become invisible");
    },

    /**
     * Wait until child element with name is added
     */
    waitUntilFoundByName: function (name, timeoutInSeconds) {
        this.waitUntil(function(element) {
            return element.elements().firstWithName(name);
        }, function(element) {
            return element.isValid();
        }, timeoutInSeconds, "to become valid");
    },

    /**
     * Wait until child element with name is removed
     */
    waitUntilNotFoundByName: function (name, timeoutInSeconds) {
        this.waitUntil(function(element) {
            return element.elements().firstWithName(name);
        }, function(element) {
            return !element.isValid();
        }, timeoutInSeconds, "to become invalid");
    },

    /**
     * Wait until element fulfills condition
     */
    waitUntil: function (filterFunction, conditionFunction, timeoutInSeconds, description) {
        timeoutInSeconds = timeoutInSeconds == null ? 5 : timeoutInSeconds;
        var element = this;
        var delay = 0.25;
        retry(function() {
            var filteredElement = filterFunction(element);
            if(!conditionFunction(filteredElement)) {
                throw(["Element", filteredElement, "failed", description, "within", timeoutInSeconds, "seconds."].join(" "));
            }
        }, Math.max(1, timeoutInSeconds/delay), delay);
    },

  /**
   * A shortcut for waiting an element to become visible and tap.
   */
  vtap: function() {
    this.waitUntilVisible(10);
    this.tap();
  },
  /**
   * A shortcut for touching an element and waiting for it to disappear.
   */
  tapAndWaitForInvalid: function() {
    this.tap();
    this.waitForInvalid();
  }
});

extend(UIAApplication.prototype, {
  /**
   * A shortcut for getting the current view controller's title from the
   * navigation bar. If there is no navigation bar, this method returns null
   */
  navigationTitle: function() {
    navBar = this.mainWindow().navigationBar();
    if (navBar) {
      return navBar.name();
    }
    return null;
  },

  /**
   * A shortcut for checking that the interface orientation in either
   * portrait mode
   */
  isPortraitOrientation: function() {
    var orientation = this.interfaceOrientation();
    return orientation == UIA_DEVICE_ORIENTATION_PORTRAIT ||
      orientation == UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN;
  },

  /**
   * A shortcut for checking that the interface orientation in one of the
   * landscape orientations.
   */
  isLandscapeOrientation: function() {
    var orientation = this.interfaceOrientation();
    return orientation == UIA_DEVICE_ORIENTATION_LANDSCAPELEFT ||
      orientation == UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT;
  }
});

extend(UIANavigationBar.prototype, {
  /**
   * Asserts that the left button's name matches the given +name+ argument
   */
  assertLeftButtonNamed: function(name) {
    assertEquals(name, this.leftButton().name());
  },

  /**
   * Asserts that the right button's name matches the given +name+ argument
   */
  assertRightButtonNamed: function(name) {
    assertEquals(name, this.rightButton().name());
  }
});

extend(UIATarget.prototype, {
  /**
   * A shortcut for checking that the interface orientation in either
   * portrait mode
   */
  isPortraitOrientation: function() {
    var orientation = this.deviceOrientation();
    return orientation == UIA_DEVICE_ORIENTATION_PORTRAIT ||
      orientation == UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN;
   },

  /**
   * A shortcut for checking that the interface orientation in one of the
   * landscape orientations.
   */
  isLandscapeOrientation: function() {
    var orientation = this.deviceOrientation();
    return orientation == UIA_DEVICE_ORIENTATION_LANDSCAPELEFT ||
      orientation == UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT;
   },

   /**
    * A convenience method for detecting that you're running on an iPad
    */
    isDeviceiPad: function() {
      //model is iPhone Simulator, even when running in iPad mode
      return this.model().match(/^iPad/) !== null ||
        this.name().match(/iPad Simulator/) !== null;
    },

    /**
     * A convenience method for detecting that you're running on an
     * iPhone or iPod touch
     */
    isDeviceiPhone: function() {
      return this.model().match(/^iPad/) === null &&
        this.name().match(/^iPad Simulator$/) === null;
    },

    /**
     * A shortcut for checking if target device is iPhone 5 (or iPod Touch
     * 5th generation)
     */
  	isDeviceiPhone5: function() {
  		var isIphone = this.isDeviceiPhone();
  		var deviceScreen = this.rect();
      	return isIphone && deviceScreen.size.height == 568;
     },

    /**
     * A convenience method for producing screenshots without status bar
     */
    captureAppScreenWithName: function(imageName) {
      var appRect = this.rect();

      appRect.origin.y     += 20.0;
      appRect.size.height  -= 20.0;

      return this.captureRectWithName(appRect, imageName);
    },

    logDeviceInfo: function() {
        UIALogger.logMessage("Dump Device:");
        UIALogger.logMessage("  model: " + this.model());
        UIALogger.logMessage("  rect: " + JSON.stringify(this.rect()));
        UIALogger.logMessage("  name: "+ this.name());
        UIALogger.logMessage("  systemName: "+ this.systemName());
        UIALogger.logMessage("  systemVersion: "+ this.systemVersion());
    }
});
extend(UIAKeyboard.prototype,{
  KEYBOARD_TYPE_UNKNOWN :-1,
  KEYBOARD_TYPE_ALPHA : 0,
  KEYBOARD_TYPE_ALPHA_CAPS : 1,
  KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION:2,
  KEYBOARD_TYPE_NUMBER:3,
  keyboardType : function() {
  if (this.keys().length < 12){
    return this.KEYBOARD_TYPE_NUMBER;
  } else if (this.keys().firstWithName("a").toString() != "[object UIAElementNil]") {
    return this.KEYBOARD_TYPE_ALPHA;
  } else if (this.keys().firstWithName("A").toString() != "[object UIAElementNil]") {
    return this.KEYBOARD_TYPE_ALPHA_CAPS;
  } else if (this.keys().firstWithName("1").toString() != "[object UIAElementNil]") {
    return this.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION;
  } else {
    return this.KEYBOARD_TYPE_UNKNOWN;
  }
  }
});

/*
TODO: Character keyboard is super slow.
*/
var typeString = function(pstrString, pbClear) {
  pstrString += ''; // convert number to string
  if (!this.hasKeyboardFocus()){
    this.tap();
  }

  UIATarget.localTarget().delay(0.5);

  if (pbClear || pstrString.length === 0) {
    this.clear();
  }

  if (pstrString.length > 0) {
    var app = UIATarget.localTarget().frontMostApp();
    var keyboard = app.keyboard();
    var keys = app.keyboard().keys();
    var buttons = app.keyboard().buttons();
    for (i = 0; i < pstrString.length; i++) {
      var intKeyboardType = keyboard.keyboardType();
      var bIsAllCaps = (intKeyboardType == keyboard.KEYBOARD_TYPE_ALPHA_CAPS); //Handles autocapitalizationType = UITextAutocapitalizationTypeAllCharacters
      var intNewKeyboardType = intKeyboardType;
      var strChar = pstrString.charAt(i);
      if ((/[a-z]/.test(strChar)) && intKeyboardType == keyboard.KEYBOARD_TYPE_ALPHA_CAPS && !bIsAllCaps) {
        buttons.firstWithName("shift").tap();
        intKeyboardType = keyboard.KEYBOARD_TYPE_ALPHA;
      } else if ((/[A-Z]/.test(strChar)) && intKeyboardType == keyboard.KEYBOARD_TYPE_ALPHA) {
        buttons.firstWithName("shift").tap();
        intKeyboardType = keyboard.KEYBOARD_TYPE_ALPHA_CAPS;
      } else if ((/[A-z]/.test(strChar)) && intKeyboardType == keyboard.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION) {
        buttons.firstWithName("more, letters").tap();
        intKeyboardType = keyboard.KEYBOARD_TYPE_ALPHA;
      } else if ((/[0-9.]/.test(strChar)) && intKeyboardType != keyboard.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION && intKeyboardType != keyboard.KEYBOARD_TYPE_NUMBER) {
        buttons.firstWithName("more, numbers").tap();
        intKeyboardType = keyboard.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION;
      }

      if ((/[a-z]/.test(strChar)) && intKeyboardType == keyboard.KEYBOARD_TYPE_ALPHA_CAPS) {
        strChar = strChar.toUpperCase();
      }
      if (strChar == " ") {
        keys["space"].tap();
      } else if (/[0-9]/.test(strChar)) { // Need to change strChar to the index key of the number because strChar = "0" will tap "1" and strChar = "1" will tap "2"
        if (strChar == "0") {
          if (intKeyboardType == keyboard.KEYBOARD_TYPE_NUMBER_AND_PUNCTUATION) {
            strChar = "9";
          } else {
            strChar = "10";
          }
        } else {
          strChar = (parseInt(strChar, 10) - 1).toString();
        }
        keys[strChar].tap();
      } else {
        keys[strChar].tap(); // TODO: this line is super slow when there are many keys
      }
      UIATarget.localTarget().delay(0.5);
    }
  }
};

extend(UIATextField.prototype,{
  typeString: typeString
});
extend(UIATextView.prototype,{
	typeString: typeString
});

extend(UIAPickerWheel.prototype, {

   /*
    * Better implementation than UIAPickerWheel.selectValue
    * Works also for texts
    * Poorly works not for UIDatePickers -> because .values() which get all values of wheel does not work :(
    * I think this is a bug in UIAutomation!
    */
   scrollToValue: function (valueToSelect) {

      var element = this;

      var values = this.values();
      var pickerValue = element.value();

      // convert to string
      valueToSelect = valueToSelect + "";

      // some wheels return for .value()  "17. 128 of 267" ?? don't know why
      // throw away all after "." but be careful lastIndexOf is used because the value can
      // also have "." in it!! e.g.: "1.2. 13 of 27"
      if (pickerValue.lastIndexOf(".") != -1) {
        var currentValue = pickerValue.substr(0, pickerValue.lastIndexOf("."));
      } else {
        var currentValue = element.value();
      }

      var currentValueIndex = values.indexOf(currentValue);
      var valueToSelectIndex = values.indexOf(valueToSelect);

      if (valueToSelectIndex == -1) {
        fail("value: " + valueToSelect + " not found in Wheel!");
      }

      var elementsToScroll = valueToSelectIndex - currentValueIndex;

      UIALogger.logDebug("number of elements to scroll: " + elementsToScroll);
      if (elementsToScroll > 0) {

          for (i=0; i<elementsToScroll; i++) {
            element.tapWithOptions({tapOffset:{x:0.35, y:0.67}});
            target.delay(0.7);
          }

      } else {

          for (i=0; i>elementsToScroll; i--) {
            element.tapWithOptions({tapOffset:{x:0.35, y:0.31}});
            target.delay(0.7);
          }
      }
   },

   /*
    * Wheels filled with values return for .value()  "17. 128 of 267" ?? don't know why -> for comparisons this is unuseful!!
    * If you want to check a value of a wheel this function is very helpful
    */
   realValue: function() {

      // current value of wheel
      var pickerValue = this.value();

      // throw away all after "." but be careful lastIndexOf is used because the value can
      if (pickerValue.lastIndexOf(".") != -1) {
        return pickerValue.substr(0, pickerValue.lastIndexOf("."));
      }

      return this.value();
   }
});

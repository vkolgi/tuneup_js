# Overview #

Tune-up is a collection of JavaScript utilities that builds upon and improves
the `UIAutomation` library provided by Apple for testing iOS applications via
Instruments (get it? "tune-up"? Instruments? get it?). 

While the JavaScript library provided by Apple is fairly complete and robust,
it is a bit wordy and repetitive at times. This project aims to reduce as much
pain as possible when writing UI tests by enhancing the existing API. It also
provides some basic structure for your tests in a manner familiar to most
testers.

# Installation #

Put the files for this project in the same location as your test scripts
that your run from Instruments. I like to use git submodules for third-party
libraries like so:

  git submodule add git://github.com/alexvollmer/tuneup_js.git tuneup

Then at the top of each test script include the following:

    #import "tuneup/tuneup.js"
    
Regardless of how you like to structure your tests, the path in the initial 
`#import` statement in your test script needs to be relative to the path
of the tuneup library.

# Test Structure #

To create a test case, use the `test()` function, which takes the name of
the test case as a string, and a function. The function will be given a
`UIATarget` instance and a `UIAApplication` instance. For example:

    test("Sign-In Screen", function(target, app) {
      // The target and app arguments are your portals into the running application
      // Exercise and validate to your heart's content
    });
    
    test("Sign-out Screen", function(target, app) {
      // now exercise and validate the sign-out screen
    });
    
See the `test.js` file for details.

## Assertions ##

Tune-up comes with a handful of basic xUnit-like assertions (and more are on
the way). For now though, the basic assertions supported are:

  * `assertNotNull`
  * `assertEquals`
  * `assertMatch`
  * `assertTrue`
  * `assertFalse`
  * `assertWindow` (more on this below)
  * `fail`

See the `assertions.js` file for all the details.
  
## Window Assertions ##
A common theme in writing integration tests for "screen flows" is the
repetitive cycle of making several assertions on a screen, then engaging some
user-control after all of the assertions pass. With the UIAutomation API as it
is, it's easy to lose sight of this structure when bogged down in the syntax of
asserting and navigating the user interface.

To make this cycle more obvious, and cut down on unnecessary verbosity, use the
`assertWindow` function. It works by applying a given JavaScript object literal
to the current main window (UIAWindow instance).

The full details are documented in `assertions.js`, but here's a taste of what
this assertion can do for your tests. Prior to `assertWindow` you would have
to do something like this:

  test("my test", function(app, target) {
    mainWindow = app.mainWindow();
    navBar = mainWindow.navigationBar();
    leftButton = navBar.leftButton();
    rightButton = navBar.rightButton();

    assertEquals("Back", leftButton.name());
    assertEquals("Done", rightButton.name());

    tableViews = mainWindow.tableViews();
    assertEquals(1, tableViews.length);
    table = tableViews[0];

    assertEquals("First Name", table.groups()[0].staticTexts()[0].name());
    assertEquals("Last Name", table.groups()[1].staticTexts()[0].name());

    assertEquals("Fred", table.cells()[0].name());
    assertEquals("Flintstone", table.cells()[1].name());
  });

With `assertWindow`, you can boil it down to this:

  test("my test", function(app, target) {
    assertWindow({
      navigationBar: {
        leftButton: { name: "Back" },
        rightButton: { name: "Done" }
      },
      tableViews: [
        {
          groups: [
            { name: "First Name" },
            { name: "Last Name" }
          ],
          cells: [
            { name: "Fred" },
            { name: "Flintstone" }
          ]
        }
      ]
    }); 
  });

You can do more than just match string literals. Check out the full
documentation in `assertions.js` for all the details.

### Window Assertions for Universal Applications ###

If you have a Universal Application and want to maintain a single set of test
files, you can mark specific properties to match by adding a "~ipad" or
"~iphone" extension to the property name. When you do this, you need to quote
the property name instead using a literal, like so:

  test("my test", function(app, target) {
    assertWindow({
      "navigationBar~iphone": {
        leftButton: { name: "Back" },
        rightButton: { name: "Done" }
      },
      "navigationBar~ipad": {
        leftButton: null,
        rightButton: { name: "Cancel" }
      },
    }); 
  });

Note that the "~iphone" extension should work for iPod Touch devices also.

This convention is derived for how device-specific images are loaded on both
iPad and iPhone/iPod devices. Hopefully it looks somewhat familiar.

## `UIAutomation` Extensions ##

The `UIAutomation` library is pretty full-featured, but is a little wordy.
Tune-up provides several extensions to the built-in `UIAutomation` classes in
an attempt to cut down on the verbosity of your tests.

See the `uiautomation-ext.js` for details.

# Note on Patches/Pull Requests #
 
  * Fork the project.
  * Make your feature addition or bug fix.
  * Test the darn thing with your own apps (built-in testing to come)
  * Commit to your local repo and send me a pull request. Bonus points for 
    topic branches.

# Copyright #

Copyright (c) 2010 Alex Vollmer. See LICENSE for details.


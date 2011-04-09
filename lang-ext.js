/**
 * Extend +destination+ with +source+
 */
function extend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
};

/**
 * Dump the properties out a String returned by the function.
 */
function dumpProperties(obj) {
  var dumpStr = "";
  for (var propName in obj) {
    if (obj.hasOwnProperty(propName)) {
      if (dumpStr != "") dumpStr += ", ";
      dumpStr += (propName + "=" + obj[propName]);
    }
  }

  return dumpStr;
}

extend(Array.prototype, {
  /**
  * Performs the given function +f+ on each element in the array instance.
  * The function is given the index of the current object and the object
  * itself for each element in the array.
  */
  each: function(f) {
    for (i = 0; i < this.length; i++) {
      f(i, this[i]);
    }
  },

  /**
   * Constructs a new array by applying the given function to each element
   * of this array.
   */
  map: function(f) {
    result = [];
    this.each(function(i,e) {
      result.push(f(i, e));
    });
    return result;
  },

  /**
   * Applies the given function to each element in the array until a
   * match is made. Otherwise returns null.
   * */
  contains: function(f) {
    for (i = 0; i < this.length; i++) {
      if (f(this[i])) return this[i];
    }
    return null;
  }
});

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};

String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
};

String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
};


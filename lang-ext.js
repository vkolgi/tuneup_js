/**
 * Extend +destination+ with +source+
 */
function extend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
};

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
  }
});

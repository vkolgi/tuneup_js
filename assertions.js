/**
 * Asserts that the given expression is true and throws an exception with
 * a default message, or the optional +message+ parameter
 */
function assertTrue(expression, message) {
  if (! expression) {
    if (! message) message = "Assertion failed";
    throw message;
  }
}

/**
 * Assert that the +received+ object matches the +expected+ object (using
 * plain ol' ==). If it doesn't, this method throws an exception with either
 * a default message, or the one given as the last (optional) argument
 */
function assertEquals(expected, received, message) {
  if (! message) message = "Expected " + expected + " but received " + received;
  assertTrue(expected == received, message);
}

/**
 * Asserts that the given expression is false and otherwise throws an 
 * exception with a default message, or the optional +message+ parameter
 */
function assertFalse(expression, message) {
  assertTrue(! expression, message);
}

/**
 * Asserts that the given object is not null or UIAElementNil (UIAutomation's
 * version of a null stand-in). If it is null, an exception is thrown with
 * a default message or the given optional +message+ parameter
 */
function assertNotNull(thingie, message) {
  if (message == null) message = "Expected not null object";
  assertTrue(thingie != null && thingie.toString() != "[object UIAElementNil]", message);
}

/**
 * Just flat-out fail the test with the given message
 */
function fail(message) {
  throw message;
}
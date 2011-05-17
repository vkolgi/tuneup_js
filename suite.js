/**
 * Run a suite of tests with the given +title+ and array of +test+ functions.  
 * 
 * Example:
 * var loginTests = function() { testSuite("LoginTests", [
 *     function() { return test("Test 1", function(target, app) {
 *     ...
 *     },options)},
 *     function() { return test("Test 2", function(target, app) {
 *     ...
 *     },options)}
 *  ])};
 *
 *  loginTests(); // Execution of a suite in a file containing suites
 *
**/
function suite(title, tests) {
    var suiteResult = true;
    UIALogger.logStart(title);
    var numberOfTests = tests.length;
    for (i = 0; i < numberOfTests; i++) {
        var result = tests[i]();
        if (!result) {
            suiteResult = false;
        }
    }
    if (suiteResult) {
        UIALogger.logPass(title);
    } else {
        UIALogger.logFail(title);
    }
}

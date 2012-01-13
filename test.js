/**
 * Run a new test with the given +title+ and function body, which will
 * be executed within the proper test declarations for the UIAutomation
 * framework. The given function will be handed a +UIATarget+ and
 * a +UIApplication+ object which it can use to exercise and validate your
 * application.
 *
 * The +options+ parameter is an optional object/hash thingie that 
 * supports the following:
 *    logTree -- a boolean to log the element tree when the test fails (default 'true')
 *
 * Example:
 * test("Sign-In", function(target, application) {
 *   // exercise and validate your application.
 * });
 *
 */
function test(title, f, options) {
  if (options == null) {
    options = {
      logTree: true
    };
  }
  target = UIATarget.localTarget();
  application = target.frontMostApp();
  UIALogger.logStart(title);
  try {
    f(target, application);
    UIALogger.logPass(title);
  }
  catch (e) {
    UIALogger.logError(e.toString());
    if (options.logTree) target.logElementTree();
    UIALogger.logFail(title);
  }
}

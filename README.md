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
that your run from Instruments. At the top of each test script include the
following:

    #import "tuneup.js"

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
  * `assertTrue`
  * `assertFalse`
  * `fail`

See the `assertions.js` file for all the details.
  
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

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

    test("my test", function(target, app) {
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

    test("my test", function(target, app) {
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

    test("my test", function(target, app) {
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

# Running Tests #

Starting in iOS 5, Apple provided a way to run Instruments from the
command-line. However, it's a bit fiddly and is very general-purpose
so doing anything _useful_ with the output is kind of a pain.

Tuneup now provides a Ruby script (`run-test`) to run your test scripts.
The runner will parse the output of your test and produce a proper
UNIX exit code based on whether or not your tests succeeded. It also
provides some niceties like automatically specifying the full-path
to your test script if you don't provide one.

Have a look at `run-test --help` to be sure you're not missing any newly
added features like fancy colors.

To use the runner, invoke it like so:

    [path to tuneup]/test_runner/run <app bundle> <test script> <output directory> [optional args]

Normally the name of the app bundle will suffice for the `<app bundle>`
argument. If you're running your tests on the simulator the newest bundle
will be located automatically. If that fails, or if you want to manually
specify the bundle to be used, you need to provide a _fully-qualified_
path to the app bundle, which will be buried somewhere in
`~/Library/Developer/Xcode/DerivedData`.

The `<test script>` argument specifies the JavaScript test file and the
`<output directory>` is where the resulting Instruments output like screenshots
and reports should go.

Run the script with `-h` or `--help` for a full explanation of supported options.

## Device or Simulator ##

If you provide the optional argument `-d DEVICE`, you can tell Instruments
to run your test against a real device (identified by UDID). You can also
pass `dynamic` and tuneup will find the UDID at runtime. If this argument is
not provided, the runner will run against the simulator.

## Preprocessing ##

The Instruments preprocessor causes a lot of headache due to its inability
to handle `#import` statements properly. If you pass `-p`, the script will
create a temp file, resolve any imports and inline the referenced files
(only once).

## Selecting tests ##

If you don't want to run your whole test suite, you can selectively run
tests by specifying the argument `-r TEST`. Whatever you pass for `TEST`
will be used as regex to match any `title` of your tests.

## XML reports ##

Tuneup can generate Xunit style reports that can be analyzed by
any compatible tool, like Jenkins. Given the parameter `-x` a XML report
will be generated in the output directory.

## Screenshots assertion ##

Tuneup can compare captured screen images against provided reference images and
generate diff images for them. This function relies on `compare` utility from
[ImageMagick](http://www.imagemagick.org). Steps to activate this feature:

1. `brew install imagemagick`.
2. In your test script create `ImageAsserter`:
```javascript
/**
* tuneup_folder     - folder with tuneup sources
* output_folder     - folder with test results
* ref_images_folder - folder with you reference images
**/
createImageAsserter('tuneup_folder', 'output_folder', 'ref_images_folder');
```

3. Assert current screen against reference image with `assertScreenMatchesImageNamed`
helper.
4. Generated diff images are located in `screens_diff` subfolder of the output
folder.

# Note on Patches/Pull Requests #

  * Fork the project.
  * Make your feature addition or bug fix.
  * Test the darn thing with your own apps (built-in testing to come)
  * Commit to your local repo and send me a pull request. Bonus points for
    topic branches.

# Copyright #

Copyright (c) 2010 Alex Vollmer. See LICENSE for details.


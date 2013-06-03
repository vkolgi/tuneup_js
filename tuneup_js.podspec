Pod::Spec.new do |s|
  s.name     = 'tuneup_js'
  s.version  = '1.0.0'
  s.license  = 'MIT'
  s.summary  = 'A JavaScript library to ease automated iOS UI testing with UIAutomation and Instruments.'
  s.homepage = 'http://tuneupjs.org'
  s.author   = {
    'Alex Vollmer' => 'alex.vollmer@gmail.com'
  }

  s.source   = {
    :git => 'https://github.com/alexvollmer/tuneup_js.git',
    :tag => 'RELEASE_1_0_0'
  }

  s.description = 'Tuneup is a collection of JavaScript utilities that builds upon and improves the UIAutomation library provided by Apple for testing iOS applications via Instruments.'

  s.platform = :ios
  # s.platform = :osx # UIAutomation isn't yet on OS X

  s.preserve_paths = '*.js'
end
Pod::Spec.new do |spec|
  spec.name             = 'tuneup_js'
  spec.version          = '1.1.1'
  spec.license          = { :type => 'MIT' }
  spec.homepage         = 'http://www.tuneupjs.org'
  spec.authors          = { 'Alex Vollmer' => 'alex.vollmer@gmail.com' }
  spec.summary          = 'A JavaScript library to ease automated iOS UI testing with UIAutomation and Instruments.'
  spec.source           = { :git => 'https://github.com/alexvollmer/tuneup_js.git', :tag => '1.1.1' }
  spec.source_files     = '*.js', 'image_asserter', 'image_assertion.rb', 'test_runner/*'
  spec.requires_arc     = false
end
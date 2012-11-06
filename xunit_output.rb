class TestSuite
  attr_reader :name
  attr_accessor :test_cases
  
  def initialize(name)
    @name = name
    @test_cases = []
  end
  
  def failures
    @test_cases.count { |test| test.failed? }
  end
end

class TestCase
  attr_reader :name
  attr_accessor :messages
  
  def initialize(name)
    @name = name
    @messages = []
    @failed = false
  end
  
  def <<(message)
    @messages << message
  end
  
  def fail!
    @failed = true;
  end
  
  def failed?
    @failed
  end
end

# Creates a XML report that conforms to # https://svn.jenkins-ci.org/trunk/hudson/dtkit/dtkit-format/dtkit-junit-model/src/main/resources/com/thalesgroup/dtkit/junit/model/xsd/junit-4.xsd
class XunitOutput
  def initialize(filename)
    @filename = filename
    @suite = TestSuite.new(File.basename(filename, File.extname(filename)))
  end
  
  def add(line)
    return if @suite.test_cases.empty?
    @suite.test_cases.last << line
  end
  
  def add_status(status, date, time, time_zone, msg)
    case status
    when :start
      @suite.test_cases << TestCase.new(msg)
    when :fail
      @suite.test_cases.last.fail!
    when :pass
    else
      @suite.test_cases.last << "#{status.to_s.capitalize}: #{msg}"
    end
  end
  
  def close
    File.open(@filename, 'w') { |f| f.write(serialize(@suite)) }
  end
  
  def serialize(suite)
    output = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" << "\n"
    output << "<testsuite name=\"#{suite.name}\" tests=\"#{suite.test_cases.count}\" failures=\"#{suite.failures}\">" << "\n"
    
    suite.test_cases.each do |test|
      output << "  <testcase name=\"#{test.name}\">" << "\n"
      if test.failed?
        output << "    <failure>#{test.messages.join("\n")}</failure>" << "\n"
      end
      output << "  </testcase>" << "\n"
    end

    output << "</testsuite>" << "\n"
  end
end
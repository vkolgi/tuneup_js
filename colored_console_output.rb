class ColoredConsoleOutput < ConsoleOutput
  COLORS = {
    :red => 31,
    :green => 32,
    :yellow => 33,
    :cyan => 36
  }
  
  STATUS_COLORS = {
    /start/i => :cyan,
    /pass/i => :green,
    /fail/i => :red,
    /error/i => :red,
    /warning/i => :yellow,
    /issue/i => :yellow
  }
  
  def format(date, time, time_zone, status, msg)
    output = super

    STATUS_COLORS.each do |pattern, color|
      return colorize(output, color) if pattern =~ status
    end
    
    output
  end
  
  def colorize(text, color)
    "\e[#{COLORS[color]}m#{text}\e[0m"
  end
end
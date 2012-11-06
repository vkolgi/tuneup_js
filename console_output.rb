class ConsoleOutput
  def add(line)
    puts line
  end
  
  def add_status(date, time, time_zone, status, msg)
    puts "\n" if /start/i =~ status     # add a blank line before each test to visually group the output
    puts format(date, time, time_zone, status, msg)
  end
  
  def format(date, time, time_zone, status, msg)
    "#{date} #{time} #{time_zone} #{status}: #{msg}"
  end
end
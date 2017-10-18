require 'beaker-rspec'
#require 'pry'

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
hosts.each do |host|
   on host, "aptitude update"
   on host, "mkdir /stor"
 end


  # Readable test descriptions
  c.formatter = :documentation

  # Configure all nodes in nodeset
  c.before :suite do
    # Install module and dependencies
    puppet_module_install(:source => proj_root, :module_name => 'couchdb')
    #hosts.each do |host|
    #  if fact('osfamily') == 'Debian'
    #    on host, puppet('module','install','puppetlabs-apt'), { :acceptable_exit_codes => [0,1] }
    #  end
    #  on host, puppet('module','install','puppetlabs-stdlib'), { :acceptable_exit_codes => [0,1] }
    #end
  end
end


require 'beaker-rspec'
#require 'pry'

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  modules_root =  proj_root + "/modules/"
hosts.each do |host|
   on host, "aptitude update"
   on host, "mkdir /stor"
 end


  # Readable test descriptions
  c.formatter = :documentation

  # Configure all nodes in nodeset
  c.before :suite do
    puppet_module_install(:source => proj_root, :module_name => 'rabbitmq')
    puppet_module_install(:source => modules_root + 'apt', :module_name => 'apt')
    puppet_module_install(:source => modules_root + 'stdlib', :module_name => 'stdlib')
    puppet_module_install(:source => modules_root + 'crosscan_base', :module_name => 'crosscan_base')
    # Install module and dependencies
    hosts.each do |host|
#        on host, 'git clone git@github.crosscan.com:infrastructure/puppet_crosscan_base.git /etc/puppet/modules/crosscan_base'
      if fact('osfamily') == 'Debian'
#        on host, puppet('module','install','puppetlabs-apt'), { :acceptable_exit_codes => [0,1] }
      end
#      on host, puppet('module','install','puppetlabs-stdlib'), { :acceptable_exit_codes => [0,1] }
    end
  end
end


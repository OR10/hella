class annostation_base::jenkins_slave(
) {
  package { 'augeas-tools':
    ensure => present,
  }

  file { '/usr/local/bin/jenkinsSwarmSlaveScreen.sh':
    source => 'puppet:///modules/annostation_base/jenkinsSwarmSlave.sh',
    owner     => root,
    group     => root,
    mode      => '755',
  }

  file_line { 'alias mysql datadir':
    path => '/etc/apparmor.d/tunables/alias',
    line => "alias /var/lib/mysql/ -> /run/shm/mysql/,",
    match => '^alias /var/lib/mysql/ -> .*$',
  }
}

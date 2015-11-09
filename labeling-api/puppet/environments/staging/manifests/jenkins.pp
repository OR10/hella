Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include php

class { '::mysql::server': }

class { 'couchdb': }

class { 'rabbitmq': }

class { 'annostation_base': }

class { 'labeling_api':
  configure_nginx => false,
}

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

class { 'ruby':
  version      => '2.0.0',
  gems_version => 'latest'
}

limits::fragment {
    "ubuntu/-/nofile":
        value => 8192
}

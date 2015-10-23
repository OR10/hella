Class['apt::update'] -> Package<| name != 'software-properties-common' |>

include php

class { '::mysql::server': }

class { 'couchdb': }

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

class { 'nodejs':
}


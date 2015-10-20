Class['apt::update'] -> Package<| name != 'software-properties-common' |>

class { 'nginx': }

include php

class { '::mysql::server': }

class { 'couchdb': }

class { 'annostation_base': }

class { 'labeling_api':
}

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

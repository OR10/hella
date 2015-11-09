Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

class { 'nginx': }

include php

class { '::mysql::server': }

class { 'couchdb': }

class { 'rabbitmq': }

class { 'annostation_base': }

class { 'labeling_api':
}

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}


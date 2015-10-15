Class['apt::update'] -> Package<| name != 'software-properties-common' |>

class { 'nginx': }

include php

class { '::mysql::server': }

file { '/var/lib/couchdb_labeling_api': 
  ensure  => directory,
  owner   => 'couchdb',
  recurse => true,
  notify  => Service['couchdb'],
  require => Package['couchdb'],
}

class { 'couchdb': }

class { 'annostation_base': }

class { 'labeling_api':
    require => Class['annostation_base'],
}

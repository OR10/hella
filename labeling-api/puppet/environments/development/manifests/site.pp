Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

class { 'nginx': }

include php

class { '::mysql::server': }

class { 'couchdb': }

class { 'annostation_base': }

class { 'labeling_api':
    require => Class['annostation_base'],
}


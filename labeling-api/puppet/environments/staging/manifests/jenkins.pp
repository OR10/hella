Class['apt::update'] -> Package<| name != 'software-properties-common' |>

include php

class { '::mysql::server': }

class { 'couchdb': }

class { 'annostation_base': }

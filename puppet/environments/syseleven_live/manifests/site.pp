Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::labeling_api

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

create_resources('couchdb::user', hiera('couchdb::users', {}))
create_resources('limits::fragment', hiera('limits::fragment', {}))

node /^app\-\d+\.live(\.*|$)/ {
    include ::php
}

node /^couchdb\-\d+\.live(\.*|$)/ {
}

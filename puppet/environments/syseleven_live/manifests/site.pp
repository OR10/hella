Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::labeling_api

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

node /^app\-\d+\.live(\.*|$)/ {
    include ::php
}

node /^couchdb\-\d+\.live(\.*|$)/ {
}

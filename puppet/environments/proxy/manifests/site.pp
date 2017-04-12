Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::annostation_letsencrypt
include ::annostation_proxy

create_resources('couchdb::user', hiera('couchdb::users', {}))
create_resources('limits::fragment', hiera('limits::fragment', {}))


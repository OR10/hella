Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::labeling_api

create_resources('couchdb::user', hiera('couchdb::users', {}))
create_resources('limits::fragment', hiera('limits::fragment', {}))
create_resources('tool_container::tool', hiera('tool_container::tools', {}))

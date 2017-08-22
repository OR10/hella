Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::php
include ::annostation_base
include ::labeling_api

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

create_resources('couchdb::user', hiera('couchdb::users', {}))
create_resources('limits::fragment', hiera('limits::fragment', {}))
create_resources('tool_container::tool', hiera('tool_container::tools', {}))

node /^labeltool\.annostation\.*/ {
}

node /^labeltool\-pouchdb\.annostation\.*/ {
}

node /^app\-server(|\-|\d+).*/ {
}

node /^(?:mysql|couch|workerqueue|app)(\-?\d+)\.annostation\..*/ {
}

node /^annostation\-ci\-slave\-.*|trusty\-jenkins/ {
  include ::annostation_base::nodejs
  include ::annostation_base::github_tokens

  class { 'ruby':
    version      => '2.0.0',
    gems_version => 'latest'
  }

  limits::fragment {
    "ubuntu/-/nofile":
      value => 65535
  }
}


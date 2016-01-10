Class['apt::update'] -> Package<| title != 'apt-transport-https' and title != 'ca-certificates' |>

include ::apt
include ::annostation_base
include ::labeling_api

file { ['/etc/AnnoStation', '/etc/AnnoStation/labeling-api']:
  ensure  => directory,
}

node /^app\-server\-.*/ {
}

node /^(?:mysql|couch|workerqueue|app)(\-?\d+)\.annostation\..*/ {
}

node /^annostation\-ci\-slave\-.*|trusty\-jenkins/ {
  include ::annostation_base::nodejs
  include ::annostation_base::jenkins

  class { 'ruby':
    version      => '2.0.0',
    gems_version => 'latest'
  }

  limits::fragment {
    "ubuntu/-/nofile":
      value => 8192
  }
}


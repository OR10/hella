class labeling_api::couch(
  $database_host = $labeling_api::params::couchdb_host,
  $database_port = $labeling_api::params::couchdb_port,
  $database_name = $labeling_api::params::database_name,
  $database_name_read_only = $labeling_api::params::database_name_read_only,
  $couchdb_user_read_only = $labeling_api::params::couchdb_user_read_only,
  $couchdb_password_read_only = $labeling_api::params::couchdb_password_read_only,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
  $max_open_files = undef,
  $max_dbs_open = 100,
  $max_http_connections = 2048,
  $max_erlang_ports = undef,
  $database_admins = [],
  $database_members = [],
) {
  include ::couchdb

  if $::labeling_api::params::couchdb_password_read_only {
    $_read_only_auth = join([uriescape($::labeling_api::params::couchdb_user_read_only), ':', uriescape($::labeling_api::params::couchdb_password_read_only), '@'], '')
  } else {
    $_read_only_auth = ""
  }

  ::couchdb::database { $database_name:
    admins  => $database_admins,
    members => $database_members,
  }

  ::couchdb::database { $database_name_read_only:
    admins  => $database_admins,
    members => $database_members,
  }

  ::couchdb::replication { "${database_name} -> ${database_name_read_only}":
       ensure  => present,
       host    => "${::couchdb::couchdb_authentication}${database_host}:${database_port}",
       source  => "http://${_read_only_auth}${database_host}:${database_port}/${database_name}",
       target  => "http://${_read_only_auth}${database_host}:${database_port}/${database_name_read_only}",
  }

  if $prepare_test_environment {
    ::couchdb::database { "${database_name}_test":
      admins  => $database_admins,
      members => $database_members,
    }
  }

  if $max_open_files {
    ::limits::fragment { 'couchdb/-/nofile':
      value  => $max_open_files,
      notify => Service[$::couchdb::service_name],
    }
  }

  file { '/etc/couchdb/local.d/labeling-api.ini':
    ensure  => file,
    notify  => Service[$::couchdb::service_name],
    content => template('labeling_api/couchdb/labeling-api.ini.erb'),
    require => Package[$::couchdb::package_name],
  }

  if $max_erlang_ports {
    file { '/etc/default/couchdb':
      ensure => present,
    }

    ->

    file_line { '/etc/default/couchdb[ERL_MAX_PORTS]':
      path    => '/etc/default/couchdb',
      line    => "ERL_MAX_PORTS=${max_erlang_ports}",
      match   => '^.*ERL_MAX_PORTS\s*=.*',
      notify  => Service[$::couchdb::service_name],
    }
  }
}

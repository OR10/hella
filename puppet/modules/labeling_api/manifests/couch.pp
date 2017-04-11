class labeling_api::couch(
  $database_host = $labeling_api::params::couchdb_host,
  $database_port = $labeling_api::params::couchdb_port,
  $database_name = $labeling_api::params::database_name,
  $database_name_read_only = $labeling_api::params::database_name_read_only,
  $couchdb_user_read_only = $labeling_api::params::couchdb_user_read_only,
  $couchdb_password_read_only = $labeling_api::params::couchdb_password_read_only,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
  $max_open_files = undef,
  $max_dbs_open = 1000,
  $max_http_connections = 4048,
) {
  include ::couchdb

  ::couchdb::database { $database_name:
    admins => ['admin'],
  }

  ::couchdb::database { $database_name_read_only:
  }

  couchdb::replication { 'read-only':
       ensure => present,
       source => "http://${$couchdb_user_read_only}:${$couchdb_password_read_only}@${database_host}:${database_port}/${database_name}",
       target => "http://${$couchdb_user_read_only}:${$couchdb_password_read_only}@${database_host}:${database_port}/${database_name_read_only}",
  }

  if $prepare_test_environment {
    ::couchdb::database { "${database_name}_test":
    }
  }

  if $max_open_files {
    ::limits::fragment { 'couchdb/-/nofile':
      value => $max_open_files,
    }
  }

  #file { '/etc/couchdb/local.ini':
  #  ensure  => present,
  #  content => '',
  #  notify  => Service['couchdb'],
  #}

  file { '/etc/couchdb/local.d/labeling-api.ini':
    ensure  => file,
    notify  => Service['couchdb'],
    content => template('labeling_api/couchdb/labeling-api.ini.erb'),
    require => Package['couchdb'],
  }

  file { '/etc/default/couchdb':
    ensure => present,
  }

  ->

  file_line { '/etc/default/couchdb':
    path    => '/etc/default/couchdb',
    line    => 'ERL_MAX_PORTS=4096',
    match   => '^.*ERL_MAX_PORTS\s*=.*',
    notify  => Service['couchdb'],
  }
}

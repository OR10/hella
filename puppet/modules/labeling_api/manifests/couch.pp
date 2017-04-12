class labeling_api::couch(
  $database_host = $labeling_api::params::couchdb_host,
  $database_port = $labeling_api::params::couchdb_port,
  $database_name = $labeling_api::params::database_name,
  $database_name_read_only = $labeling_api::params::database_name_read_only,
  $couchdb_user_read_only = $labeling_api::params::couchdb_user_read_only,
  $couchdb_password_read_only = $labeling_api::params::couchdb_password_read_only,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
) {
  include ::couchdb

  ::couchdb::database { $database_name:
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
}

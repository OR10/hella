class labeling_api::couch(
  $database_name = $labeling_api::params::database_name,
  $database_name_read_only = $labeling_api::params::database_name_read_only,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
) {
  include ::couchdb

  ::couchdb::database { $database_name:
  }
  ::couchdb::database { $database_name_read_only:
  }

  if $prepare_test_environment {
    ::couchdb::database { "${database_name}_test":
    }
  }
}

class labeling_api::couch(
  $database_name = $labeling_api::params::database_name,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
) {
  include ::couchdb

  ::couchdb::database { $database_name:
  }

  if $prepare_test_environment {
    ::couchdb::database { "${database_name}_test":
    }
  }
}

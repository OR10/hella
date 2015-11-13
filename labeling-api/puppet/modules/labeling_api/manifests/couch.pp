class labeling_api::couch(
  $database_name,
  $prepare_test_environment = false,
) {
  include ::couchdb

  ::couchdb::database { $database_name: }

  if $prepare_test_environment {
    ::couchdb::database { "${database_name}_test": }
  }
}

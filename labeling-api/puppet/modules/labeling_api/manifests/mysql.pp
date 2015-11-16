class labeling_api::mysql(
  $database_name = $labeling_api::params::database_name,
  $database_user = $labeling_api::params::database_user,
  $database_password = $labeling_api::params::database_password,
  $allowed_host = $labeling_api::params::allowed_host,
  $prepare_test_environment = $labeling_api::params::prepare_test_environment,
) {
  include ::mysql::server

  ::mysql::db { $database_name:
    user     => $database_user,
    password => $database_password,
    host     => $allowed_host,
  }

  if $prepare_test_environment {
    ::mysql::db { "${database_name}_test":
      user     => $database_user,
      password => $database_password,
      host     => $allowed_host,
    }
  }
}

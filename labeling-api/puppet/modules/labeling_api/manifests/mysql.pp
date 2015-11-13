class labeling_api::mysql(
  $database_name,
  $database_user,
  $database_password,
  $allowed_host = '%',
  $prepare_test_environment = false,
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

class labeling_api(
    $root_dir,
    $data_dir,
    $configure_nginx = true,
    $run_composer_install = false,
    $app_main_script = 'app.php',
    $config_dir = undef,
    $prepare_test_environment = false,
    $database_host = '127.0.0.1',
    $database_port = 'null',
    $database_name = 'symfony',
    $database_user = 'root',
    $database_password = 'null',
    $mailer_transport = 'smtp',
    $mailer_host = '127.0.0.1',
    $mailer_user = 'null',
    $mailer_password = 'null',
    $secret = 'ThisTokenIsNotSoSecretChangeIt',
) {

  ::mysql::db { $database_name:
    user     => $database_user,
    password => $database_password,
    host     => '%',
  }

  ::couchdb::database { $database_name: }


  if $prepare_test_environment {
    ::mysql::db { "${database_name}_test":
      user     => $database_user,
      password => $database_password,
      host     => '%',
    }

    ::couchdb::database { "${database_name}_test": }

    if ($config_dir == undef) {
      $test_config_file = "${root_dir}/app/config/parameters_test.yml"
    } else {
      $test_config_file = "${config_dir}/parameters_test.yml"
    }

    file { $test_config_file:
      ensure  => file,
      content => template('labeling_api/parameters_test.yml.erb'),
    }

  }

  if ($config_dir == undef) {
    $config_file = "${root_dir}/app/config/parameters.yml"
  } else {
    $config_file = "${config_dir}/parameters.yml"
  }

  file { $config_file:
    ensure  => file,
    content => template('labeling_api/parameters.yml.erb'),
  }

  if $run_composer_install {
      class { 'labeling_api::vagrant_composer_install': }
  }

  if $configure_nginx {
    nginx::resource::vhost { "_":
      ensure      => present,
      www_root    => "${root_dir}/web",
      index_files => [$app_main_script],
      try_files   => ['$uri', "/${app_main_script}\$is_args\$args"],
    }

    nginx::resource::location { '~ \.php(/|$)':
      ensure        => present,
      www_root      => "${root_dir}/web",
      vhost         => '_',
      index_files   => [$app_main_script],
      fastcgi       => '127.0.0.1:9000',
      fastcgi_param => {
          'SCRIPT_FILENAME' => '$document_root$fastcgi_script_name',
      },
    }
  }

  file { "${data_dir}":
    ensure => "directory",
    mode   => "777",
  }
}

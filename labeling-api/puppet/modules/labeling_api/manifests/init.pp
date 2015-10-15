class labeling_api(
    $root_dir,
    $is_vagrant,
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

  file { "${root_dir}/app/config/parameters.yml":
    ensure  => file,
    content => template('labeling_api/parameters.yml.erb'),
  }

  if $is_vagrant {
      class { 'labeling_api::vagrant_composer_install': }
  }

  nginx::resource::vhost { "_":
    ensure      => present,
    www_root    => "${root_dir}/web",
    index_files => ['app_dev.php'],
    try_files   => ['$uri', '/app_dev.php$is_args$args'],
  }

  nginx::resource::location { '~ \.php(/|$)':
    ensure        => present,
    www_root      => "${root_dir}/web",
    vhost         => '_',
    index_files   => ['app_dev.php'],
    fastcgi       => '127.0.0.1:9000',
    fastcgi_param => {
        'SCRIPT_FILENAME' => '$document_root$fastcgi_script_name',
    },
  }
}

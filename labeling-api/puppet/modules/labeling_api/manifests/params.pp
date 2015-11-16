class labeling_api::params(
  $config_dir,
  $cache_dir,

  $configure_nginx = true,
  $prepare_test_environment = false,

  $database_host = '127.0.0.1',
  $database_port = 'null',
  $database_name = 'symfony',
  $database_user = 'root',
  $database_password = 'null',

  $couchdb_host = '127.0.0.1',
  $couchdb_port = 5984,
  $couchdb_user = undef,
  $couchdb_password = undef,

  $mailer_transport = 'smtp',
  $mailer_host = '127.0.0.1',
  $mailer_user = 'null',
  $mailer_password = 'null',

  $secret = 'ThisTokenIsNotSoSecretChangeIt',

  $ffmpeg_executable = 'avconv',
  $ffprobe_executable = 'avprobe',

  $rabbitmq_host = '127.0.0.1',
  $rabbitmq_port = 5672,
  $rabbitmq_vhost = '/',
  $rabbitmq_user = 'guest',
  $rabbitmq_password = 'guest',
  $rabbitmq_use_dead_letter_exchange = true,
  $rabbitmq_use_alternate_exchange = true,

  $frame_cdn_dir,
  $frame_cdn_base_url,
  $frame_cdn_port = 80,

  $user_password,

  $create_parameter_files = false,
) {
  file { "${config_dir}/parameters.yml":
    ensure  => file,
    content => template('labeling_api/parameters.yml.erb'),
  }

  if $prepare_test_environment {
    file { "${config_dir}/parameters_test.yml":
      ensure  => file,
      content => template('labeling_api/parameters_test.yml.erb'),
    }
  }
}

class labeling_api::params(
  $config_dir = undef,
  $cache_dir = undef,

  $configure_nginx = true,
  $prepare_test_environment = false,

  $database_host = '127.0.0.1',
  $database_port = 'null',
  $database_name = 'symfony',
  $database_user = 'root',
  $database_password = 'null',
  $database_allowed_host = '127.0.0.1',

  $couchdb_host = '127.0.0.1',
  $couchdb_host_external = '127.0.0.1',
  $couchdb_port = 5984,
  $couchdb_port_external = 5984,
  $couchdb_user = undef,
  $couchdb_password = undef,

  $pouchdb_feature_enabled = false,

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
  $rabbitmq_management_port = 15672,

  $redis_host = '127.0.0.1',
  $redis_port = '6379',

  # valid types are: filesystem, s3, s3-cmd
  $frame_cdn_type = 'filesystem',
  $video_cdn_type = 'filesystem',

  # in case of using a filesystem
  $frame_cdn_dir = undef,
  $video_cdn_dir = undef,

  # in case of using a s3 storage
  $frame_cdn_s3_base_url = undef,
  $frame_cdn_s3_bucket   = undef,
  $frame_cdn_s3_region   = undef,
  $frame_cdn_s3_key      = undef,
  $frame_cdn_s3_secret   = undef,

  $video_cdn_s3_base_url = undef,
  $video_cdn_s3_bucket   = undef,
  $video_cdn_s3_region   = undef,
  $video_cdn_s3_key      = undef,
  $video_cdn_s3_secret   = undef,

  # additional parameters in case of using s3cmd tool
  $s3cmd_executable                         = 's3cmd',
  $parallel_executable                      = 'parallel',

  $frame_cdn_s3_host_base                   = undef,
  $frame_cdn_s3_host_bucket                 = undef,
  $frame_cdn_s3_parallel_uploads_per_worker = 10,

  $video_cdn_s3_host_base                   = undef,
  $video_cdn_s3_host_bucket                 = undef,
  $video_cdn_s3_parallel_uploads_per_worker = 10,

  # general settings for the nginx vhost
  $frame_cdn_base_url       = undef,
  $frame_cdn_port           = 80,
  $frame_cdn_allowed_origin = undef,
  $frame_cdn_expires        = '30d',

  $user_password = undef,

  $create_parameter_files = false,
) {
  if $create_parameter_files {
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
}

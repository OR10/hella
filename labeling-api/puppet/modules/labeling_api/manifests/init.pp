class labeling_api(
    $root_dir,
    $cache_dir,
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
    $ffmpeg_executable = 'avconv',
    $ffprobe_executable = 'avprobe',
    $frame_cdn_dir = undef,
    $frame_cdn_scheme = "http",
    $frame_cdn_hostname = undef,
    $frame_cdn_network_device = undef,
    $frame_cdn_port = 81,
    $frame_cdn_path = '',
    $frame_cdn_allowed_origin = undef,
    $user_password = undef,
    $is_vagrant_vm = false,
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

    if $frame_cdn_dir != undef {
      file { ['/var', '/var/www', $frame_cdn_dir]:
        ensure => directory,
        mode   => '777',
      }

      if $frame_cdn_hostname == undef {
        if $frame_cdn_network_device != undef {
          $frame_cdn_real_hostname = $facts['networking']['interfaces'][$frame_cdn_network_device]['ip']
        }
      } else {
        $frame_cdn_real_hostname = $frame_cdn_hostname
      }

      if $configure_nginx {
        file { '/etc/nginx/cdn-cors.conf':
          ensure  => file,
          content => template('labeling_api/framecdn-cors.conf.erb'),
        }

        nginx::resource::vhost { "cdn":
          ensure      => present,
          www_root    => "${frame_cdn_dir}",
          listen_port => "${frame_cdn_port}",
          index_files => [],
          try_files   => ['$uri', "=404"],
          require     => File[$frame_cdn_dir],
          location_cfg_append => {
            'include' => '/etc/nginx/cdn-cors.conf',
          }
        }
      }
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
      ensure               => present,
      www_root             => "${root_dir}/web",
      index_files          => [$app_main_script],
      try_files            => ['$uri', "/${app_main_script}\$is_args\$args"],
      client_max_body_size => '512M',
    }

    if $is_vagrant_vm {
      file { '/var/www/labeling-ui':
        ensure => 'link',
        target => '/labeling-ui/Distribution',
      }
    }

    nginx::resource::location { '/labeling':
      ensure         => present,
      vhost          => '_',
      location_alias => '/var/www/labeling-ui',
      location_cfg_append => {
          try_files => '$uri /labeling/index.html',
      }
    }

    nginx::resource::location { '~ \.php(/|$)':
      ensure               => present,
      www_root             => "${root_dir}/web",
      vhost                => '_',
      index_files          => [$app_main_script],
      try_files            => ['$uri', '/labeling/index.html'],
      fastcgi              => '127.0.0.1:9000',
      fastcgi_param        => {
          'SCRIPT_FILENAME' => '$document_root$fastcgi_script_name',
      },
      location_cfg_append => {
          fastcgi_read_timeout => '900',
      }
    }
  }

  file { "${cache_dir}":
    ensure => "directory",
    mode   => "777",
  }
}

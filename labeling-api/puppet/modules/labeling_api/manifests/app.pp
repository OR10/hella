class labeling_api::app(
  $root_dir,
  $cache_dir,
  $configure_nginx = true,
  $app_main_script = 'app.php',
  $is_vagrant_vm = false,
) {
  include ::php
  include ::nginx
  include labeling_api::common

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
        require => File['/var/www'],
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

  if $cache_dir != '/var/cache/labeling_api' {
    file { $cache_dir:
      ensure => "directory",
      mode   => "777",
    }
  }
}

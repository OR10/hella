class labeling_api::app(
  $root_dir,
  $cache_dir = $labeling_api::params::cache_dir,
  $configure_nginx = $labeling_api::params::configure_nginx,
  $app_main_script = 'app.php',
  $labeling_ui_dir = '/var/www/labeling-ui',
  $client_max_body_size = '512M',
  $is_vagrant_vm = false,
) {
  include ::php
  include ::nginx
  include ::labeling_api::common

  if $configure_nginx {
    nginx::resource::vhost { "_":
      ensure               => present,
      www_root             => "${root_dir}/web",
      index_files          => [$app_main_script],
      try_files            => ['$uri', "/${app_main_script}\$is_args\$args"],
      client_max_body_size => $client_max_body_size,
    }

    nginx::resource::location { '/labeling':
      ensure         => present,
      vhost          => '_',
      location_alias => $labeling_ui_dir,
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

  if $is_vagrant_vm {
    file { $labeling_ui_dir:
      ensure => 'link',
      target => '/labeling-ui/Distribution',
    }
  }
}

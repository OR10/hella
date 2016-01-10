class labeling_api::app(
  $root_dir,
  $cache_dir = $labeling_api::params::cache_dir,
  $configure_nginx = $labeling_api::params::configure_nginx,
  $app_main_script = 'app.php',
  $labeling_ui_dir = '/var/www/labeling-ui',
  $client_max_body_size = '512M',
  $is_vagrant_vm = false,
  $port = 80,
  $httpv2 = false,
) {
  include ::php
  include ::nginx
  include ::labeling_api::common

  if $configure_nginx {
    $_uiLocationCfgAppend = {
      try_files => '$uri /labeling/index.html',
    }

    $_phpLocationCfgAppend = {
      fastcgi_read_timeout => '900',
    }

    $_phpFastCgiParams = {
      'SCRIPT_FILENAME' => '$document_root$fastcgi_script_name',
    }

    if $httpv2 and $port == 80 {
      $_vhostPort = 443
    } else {
      $_vhostPort = $port
    }

    labeling_api::nginx_vhost { '_':
      vhostDir          => "${root_dir}/web",
      vhostPort         => $_vhostPort,
      httpv2            => $httpv2,
      sslCertFile       => '/etc/nginx/ssl-certificate.crt',
      sslKeyFile        => '/etc/nginx/ssl-certificate.key',
      indexFiles        => [$app_main_script],
      tryFiles          => ['$uri', "/${app_main_script}\$is_args\$args"],
      clientMaxBodySize => $client_max_body_size,
    }

    nginx::resource::location { '/labeling':
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      vhost               => '_',
      location_alias      => $labeling_ui_dir,
      location_cfg_append => $_uiLocationCfgAppend,
    }

    nginx::resource::location { '~ \.php(/|$)':
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      www_root            => "${root_dir}/web",
      vhost               => '_',
      index_files         => [$app_main_script],
      try_files           => ['$uri', '/labeling/index.html'],
      fastcgi             => '127.0.0.1:9000',
      fastcgi_param       => $_phpFastCgiParams,
      location_cfg_append => $_phpLocationCfgAppend,
    }
  }

  if $is_vagrant_vm {
    file { $labeling_ui_dir:
      ensure => 'link',
      target => '/labeling-ui/Distribution',
    }
  }
}

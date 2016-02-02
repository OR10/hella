define annostation_base::symfony(
  $app_path,
  $configure_nginx = false,
  $app_main_script = 'app.php',
  $client_max_body_size = '512M',
  $port = 80,
  $httpv2 = false,
  $not_found_redirect = '=404',
  $authBasic = undef,
  $authBasicFile = undef,
) {
  include ::php
  include ::nginx

  if $configure_nginx {
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

    annostation_base::nginx_vhost { $name:
      vhostDir          => "${app_path}/web",
      vhostPort         => $_vhostPort,
      httpv2            => $httpv2,
      sslCertFile       => "/etc/nginx/${name}-ssl-certificate.crt",
      sslKeyFile        => "/etc/nginx/${name}-ssl-certificate.key",
      indexFiles        => [$app_main_script],
      tryFiles          => ['$uri', "/${app_main_script}\$is_args\$args"],
      clientMaxBodySize => $client_max_body_size,
    }

    nginx::resource::location { '~ \.php(/|$)':
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      www_root            => "${app_path}/web",
      vhost               => $name,
      index_files         => [$app_main_script],
      try_files           => ['$uri', $not_found_redirect],
      fastcgi             => '127.0.0.1:9000',
      fastcgi_param       => $_phpFastCgiParams,
      location_cfg_append => $_phpLocationCfgAppend,
    }
  }
}

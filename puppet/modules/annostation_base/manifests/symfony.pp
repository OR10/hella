define annostation_base::symfony(
  $www_root,
  $configure_nginx = false,
  $app_main_script = 'app.php',
  $client_max_body_size = '512M',
  $hostnames = undef,
  $port = 80,
  $httpv2 = false,
  $not_found_redirect = '=404',
  $authBasic = undef,
  $authBasicFile = undef,
  $sslCertFile = undef,
  $sslKeyFile = undef,
  $listenIp = '*',
  $useDefaultLocation = true,
  $useVersioning = false,
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

    if $sslCertFile {
      $_sslCertFile = $sslCertFile
    } else {
      $_sslCertFile = "/etc/nginx/${name}-ssl-certificate.crt"
    }

    if $sslKeyFile {
      $_sslKeyFile = $sslKeyFile
    } else {
      $_sslKeyFile = "/etc/nginx/${name}-ssl-certificate.key"
    }

    if $hostnames {
        $_hostnames = $hostnames
    } else {
        $_hostnames = [$name]
    }

    annostation_base::nginx_vhost { $name:
      vhostDir           => $www_root,
      vhostPort          => $_vhostPort,
      httpv2             => $httpv2,
      sslCertFile        => $_sslCertFile,
      sslKeyFile         => $_sslKeyFile,
      indexFiles         => [$app_main_script],
      tryFiles           => ['$uri', "/${app_main_script}\$is_args\$args"],
      clientMaxBodySize  => $client_max_body_size,
      authBasic          => $authBasic,
      authBasicFile      => $authBasicFile,
      listenIp           => $listenIp,
      useDefaultLocation => $useDefaultLocation,
      serverNames        => $hostnames,
    }

    nginx::resource::location { "${name}_php":
      location            => '~ \.php(/|$)',
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      www_root            => $www_root,
      vhost               => $name,
      index_files         => [$app_main_script],
      try_files           => ['$uri', $not_found_redirect],
      fastcgi             => '127.0.0.1:9000',
      fastcgi_param       => $_phpFastCgiParams,
      location_cfg_append => $_phpLocationCfgAppend,
    }

    if $useVersioning {
      nginx::resource::location { "${name}_api":
        location            => '/api',
        ssl                 => $httpv2,
        ssl_only            => $httpv2,
        ensure              => present,
        www_root            => $www_root,
        vhost               => $name,
        index_files         => [$app_main_script],
        try_files           => ['$uri', "@rewrite"],
        fastcgi             => '127.0.0.1:9000',
        fastcgi_param       => $_phpFastCgiParams,
        location_cfg_append => $_phpLocationCfgAppend,
      }

      nginx::resource::location { "${name}_rewrite":
        ensure              => present,
        ssl                 => $httpv2,
        ssl_only            => $httpv2,
        vhost               => $name,
        www_root            => $www_root,
        location => '@rewrite',
        location_cfg_append  => {
          'rewrite' => "/api/v(\d+)/ /${app_main_script}?version=v\$1&$args last"
        }
      }
    }
  }
}
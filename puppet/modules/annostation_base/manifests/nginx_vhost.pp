define annostation_base::nginx_vhost(
  $vhostDir,
  $vhostPort = 80,
  $httpv2 = false,
  $indexFiles = [],
  $tryFiles = ['$uri', '=404'],
  $locationRawPrepend = [],
  $locationCfgAppend = {},
  $addHeader = {},
  $vhostCfgAppend = {},
  $sslCertFile = undef,
  $sslKeyFile = undef,
  $clientMaxBodySize = '2M',
  $authBasic = undef,
  $authBasicFile = undef,
  $useDefaultLocation = true,
  $proxy = undef,
  $proxyHeaders = []
) {
  if $proxy {
    $_vhostDir = undef
  } else {
    $_vhostDir = $vhostDir
  }

  if $httpv2 {
    nginx::resource::vhost { $name:
      ensure               => present,
      www_root             => $_vhostDir,
      listen_port          => $vhostPort,
      listen_options       => 'http2',
      ssl                  => true,
      ssl_cert             => $sslCertFile,
      ssl_key              => $sslKeyFile,
      ssl_port             => $vhostPort,
      index_files          => $indexFiles,
      try_files            => $tryFiles,
      location_raw_prepend => $locationRawPrepend,
      location_cfg_append  => $locationCfgAppend,
      add_header           => $addHeader,
      vhost_cfg_prepend    => $vhostCfgAppend,
      client_max_body_size => $clientMaxBodySize,
      auth_basic           => $authBasic,
      auth_basic_user_file => $authBasicFile,
      use_default_location => $useDefaultLocation,
      proxy                => $proxy,
      proxy_set_header     => $proxyHeaders,
    }

    nginx::resource::vhost { "${name}-redirect":
      ensure               => present,
      location_custom_cfg => {
        'return' => 'https://$host$request_uri',
      },
    }
  } else {
    nginx::resource::vhost { $name:
      ensure               => present,
      www_root             => $_vhostDir,
      listen_port          => $vhostPort,
      index_files          => $indexFiles,
      try_files            => $tryFiles,
      location_raw_prepend => $locationRawPrepend,
      location_cfg_append  => $locationCfgAppend,
      add_header           => $addHeader,
      vhost_cfg_prepend    => $vhostCfgAppend,
      client_max_body_size => $clientMaxBodySize,
      auth_basic           => $authBasic,
      auth_basic_user_file => $authBasicFile,
      use_default_location => $useDefaultLocation,
      proxy                => $proxy,
      proxy_set_header     => $proxyHeaders,
    }
  }
}

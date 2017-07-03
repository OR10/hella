class labeling_api::cdn(
  $configure_nginx = $labeling_api::params::configure_nginx,

  $type = $labeling_api::params::frame_cdn_type,

  $vhost_dir = $labeling_api::params::frame_cdn_dir,
  $proxy = $labeling_api::params::frame_cdn_s3_base_url,
  $proxy_host = undef,

  $hostnames = $labeling_api::params::frame_cdn_hostnames,
  $vhost_port = $labeling_api::params::frame_cdn_port,

  $allowed_origin = $labeling_api::params::frame_cdn_allowed_origin,
  $expires = $labeling_api::params::frame_cdn_expires,

  $httpv2 = false,
  $sslCertFile = '/etc/nginx/labeling_api-ssl-certificate.crt',
  $sslKeyFile = '/etc/nginx/labeling_api-ssl-certificate.key',
) {
  if $configure_nginx {
    include ::nginx
    include ::labeling_api::common

    $_addHeader = {
      'Pragma'        => 'public',
      'Cache-Control' => '"public"',
    }

    $_vhostCfgAppend = {
      'expires' => $expires,
    }

    if $allowed_origin != undef {
      $_locationRawPrepend = [
        "if (\$request_method = 'OPTIONS') {",
        "  add_header 'Access-Control-Allow-Origin' '${allowed_origin}';",
        "  add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';",
        "  add_header 'Content-Length' 0;",
        "  return 204;",
        "}",
        "",
        "if (\$request_method = 'GET') {",
        "  add_header 'Access-Control-Allow-Origin' '${allowed_origin}';",
        "  add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';",
        "}",
      ]
    } else {
      $_locationRawPrepend = []
    }

    case $type {
      'filesystem': {
        annostation_base::nginx_vhost { 'labeling_api_cdn':
          vhostDir           => $vhost_dir,
          vhostPort          => $vhost_port,
          httpv2             => $httpv2,
          sslCertFile        => $sslCertFile,
          sslKeyFile         => $sslKeyFile,
          locationRawPrepend => $_locationRawPrepend,
          addHeader          => $_addHeader,
          vhostCfgAppend     => $_vhostCfgAppend,
          serverNames        => $hostnames,
        }
      }
      's3': {
        if $proxy_host {
          $_proxyHostHeader = $proxy_host
        } else {
          $_proxyHostHeader = regsubst($proxy, '^https?\:\/\/', '')
        }

        annostation_base::nginx_vhost { 'labeling_api_cdn':
          proxy              => $proxy,
          proxyHeaders       => ["Host ${_proxyHostHeader}"],
          vhostDir           => $vhost_dir,
          vhostPort          => $vhost_port,
          httpv2             => $httpv2,
          sslCertFile        => $sslCertFile,
          sslKeyFile         => $sslKeyFile,
          locationRawPrepend => $_locationRawPrepend,
          addHeader          => $_addHeader,
          vhostCfgAppend     => $_vhostCfgAppend,
          serverNames        => $hostnames,
        }
      }
      's3-cmd': {
        if $proxy_host {
          $_proxyHostHeader = $proxy_host
        } else {
          $_proxyHostHeader = regsubst($proxy, '^https?\:\/\/', '')
        }

        annostation_base::nginx_vhost { 'labeling_api_cdn':
          proxy              => $proxy,
          proxyHeaders       => ["Host ${_proxyHostHeader}"],
          vhostDir           => $vhost_dir,
          vhostPort          => $vhost_port,
          httpv2             => $httpv2,
          sslCertFile        => $sslCertFile,
          sslKeyFile         => $sslKeyFile,
          locationRawPrepend => $_locationRawPrepend,
          addHeader          => $_addHeader,
          vhostCfgAppend     => $_vhostCfgAppend,
          serverNames        => $hostnames,
        }
      }
      default: {
        fail("Unsupported frame cdn type: ${type}")
      }
    }
  }
}

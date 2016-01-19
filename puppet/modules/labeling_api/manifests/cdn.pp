class labeling_api::cdn(
  $configure_nginx = $labeling_api::params::configure_nginx,
  $vhost_dir = $labeling_api::params::frame_cdn_dir,
  $vhost_name = '_',
  $vhost_port = $labeling_api::params::frame_cdn_port,
  $allowed_origin = $labeling_api::params::frame_cdn_allowed_origin,
  $expires = $labeling_api::params::frame_cdn_expires,
  $httpv2 = false,
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

    annostation_base::nginx_vhost { 'cdn':
      vhostDir           => $vhost_dir,
      vhostPort          => $vhost_port,
      httpv2             => $httpv2,
      sslCertFile        => '/etc/nginx/ssl-certificate.crt',
      sslKeyFile         => '/etc/nginx/ssl-certificate.key',
      locationRawPrepend => $_locationRawPrepend,
      addHeader          => $_addHeader,
      vhostCfgAppend     => $_vhostCfgAppend,
    }
  }
}

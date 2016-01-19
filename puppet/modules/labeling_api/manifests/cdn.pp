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

    $_locationCfgAppend = {
      'include' => '/etc/nginx/cdn-cors.conf',
    }

    $_addHeader = {
      'Pragma'        => 'public',
      'Cache-Control' => '"public"',
    }

    $_vhostCfgAppend = {
      'expires' => $expires,
    }

    file { '/etc/nginx/cdn-cors.conf':
      ensure  => file,
      content => template('labeling_api/cdn/cors.conf.erb'),
      require => Package['nginx'],
    }

    annostation_base::nginx_vhost { 'cdn':
      vhostDir          => $vhost_dir,
      vhostPort         => $vhost_port,
      httpv2            => $httpv2,
      sslCertFile       => '/etc/nginx/ssl-certificate.crt',
      sslKeyFile        => '/etc/nginx/ssl-certificate.key',
      locationCfgAppend => $_locationCfgAppend,
      addHeader         => $_addHeader,
      vhostCfgAppend    => $_vhostCfgAppend,
    }
  }
}

class labeling_api::cdn(
  $configure_nginx = $labeling_api::params::configure_nginx,
  $vhost_dir = $labeling_api::params::frame_cdn_dir,
  $vhost_name = '_',
  $vhost_port = $labeling_api::params::frame_cdn_port,
  $allowed_origin = undef,
  $expires = '30d',
) {
  if $configure_nginx {
    include ::nginx
    include ::labeling_api::common

    file { '/etc/nginx/cdn-cors.conf':
      ensure  => file,
      content => template('labeling_api/cdn/cors.conf.erb'),
      require => Package['nginx'],
    }

    nginx::resource::vhost { 'cdn':
      ensure      => present,
      www_root    => $vhost_dir,
      listen_port => $vhost_port,
      index_files => [],
      try_files   => ['$uri', '=404'],
      require     => File[$vhost_dir],
      location_cfg_append => {
        'include' => '/etc/nginx/cdn-cors.conf',
      },
      add_header => {
        'Pragma' => 'public',
        'Cache-Control' => '"public"',
      },
      vhost_cfg_prepend => {
        'expires' => $expires,
      },
    }
  }
}

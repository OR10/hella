class labeling_api::cdn(
  $vhost_dir = '/var/www/frame_cdn',
  $vhost_name = '_',
  $vhost_port = 80,
  $allowed_origin = undef,
  $expires = '30d',
) {
  include ::nginx
  include labeling_api::common

    if $vhost_dir != '/var/www/frame_cdn' {
      file { $vhost_dir:
        ensure => directory,
        require => File['/var/www'],
      }
    }

    file { '/etc/nginx/cdn-cors.conf':
      ensure  => file,
      content => template('labeling_api/cdn/cors.conf.erb'),
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

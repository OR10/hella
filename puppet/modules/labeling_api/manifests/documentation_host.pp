class labeling_api::documentation_host(
  $vHost = 'labeling_api',
  $configureNginx = true,
  $docRoot = '/var/www/labeling-documentation',
  $httpv2 = false,
  $auth_basic_users = {},
) {
  include ::nginx

  file { $docRoot:
    ensure => directory,
    owner => 'www-data',
    group => 'www-data',
  }

  file { "${docRoot}/index.html":
    ensure  => present,
    owner   => 'www-data',
    group   => 'www-data',
    source  => 'puppet:///modules/labeling_api/documentation_index.html',
    require => File[$docRoot],
  }

  if $configureNginx {
    if $httpv2 and $port == 80 {
      $_vhostPort = 443
    } else {
      $_vhostPort = $port
    }

    file { '/etc/nginx/labeling_documentation.htpasswd':
      ensure => file,
      content => template('labeling_api/htpasswd.erb'),
    }

    nginx::resource::location { 'labeling_documentation':
      ensure               => present,
      vhost                => $vHost,
      location_alias       => $docRoot,
      location             => '/documentation',
      autoindex            => 'on',
      ssl                  => $httpv2,
      ssl_only             => $httpv2,
      auth_basic           => 'Labeling Documentation',
      auth_basic_user_file => '/etc/nginx/labeling_documentation.htpasswd',
      location_cfg_append  => {
        index => ['index.html'],
      },
    }

  }
}

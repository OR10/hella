class annostation_proxy(
  $hosts = [],
  $defaultSslCert,
  $defaultSslKey,
) {
  include ::nginx

  file { ['/var/www', '/var/www/default']:
    ensure => directory,
  }

  file { '/var/www/default/index.html':
    ensure  => present,
    mode    => '0644',
    content => 'Nothing here',
    require => File['/var/www/default'],
  }

  ::nginx::resource::vhost { 'default':
    server_name        => ['_'],
    listen_port        => 443,
    listen_options     => 'default',
    ssl                => true,
    ssl_port           => 443,
    ssl_cert           => $defaultSslCert,
    ssl_key            => $defaultSslKey,
    require            => File['/var/www/default/index.html'],
    www_root           => '/var/www/default',
  }

  $_domains = $hosts.reduce([]) |$domains, $host| {
    $tmp_domains = $domains + $host['domain']
    $tmp_domains
  }

  nginx::resource::vhost { "default-redirect":
    ensure               => present,
    server_name          => $_domains,
    listen_options     => 'default',
    location_custom_cfg  => {
      'return' => 'https://$host$request_uri',
    },
    require => File['/var/www/default/index.html'],
  }

  $hosts.each |$host| {
    if !has_key($host, 'domain') {
      fail('A configured proxy host requires a domain')
    }

    if !has_key($host, 'target') {
      fail('A configured proxy host requires a target')
    }

    $_domain = $host['domain']
    $_target = $host['target']
    $_http2  = pick($host['http2'], false)
    $_useSsl = pick($host['ssl'], $_http2, false)

    if $_useSsl {
      $_defaultPort = 443
    } else {
      $_defaultPort = 80
    }

    if $_http2 {
      $_listenOptions = 'http2'
    } else {
      $_listenOptions = undef
    }

    if $_useSsl {
      if !has_key($host, 'ssl_cert') {
        fail('A ssl proxy requires a ssl certificate')
      }

      if !has_key($host, 'ssl_key') {
        fail('A ssl proxy requires a ssl key')
      }

      $_sslCert = $host['ssl_cert']
      $_sslKey  = $host['ssl_key']
    } else {
      $_sslCert = undef
      $_sslKey  = undef
    }

    $_listenPort       = pick($host['port'], $_defaultPort)
    $_proxyReadTimeout = pick($host['read_timeout'], 90)

    ::nginx::resource::vhost { "${_domain}:${_listenPort}":
      server_name        => [$_domain],
      listen_port        => $_listenPort,
      listen_options     => $_listenOptions,
      ssl                => $_useSsl,
      ssl_port           => $_listenPort,
      ssl_cert           => $_sslCert,
      ssl_key            => $_sslKey,
      proxy              => $_target,
      proxy_set_header   => ["Host ${_domain}"],
      proxy_read_timeout => $_proxyReadTimeout,
    }
  }
}

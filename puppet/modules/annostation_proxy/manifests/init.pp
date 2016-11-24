class annostation_proxy(
  $hosts = []
) {
  include ::nginx

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

    ::nginx::resource::vhost { $_domain:
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

    if $_useSsl {
      nginx::resource::vhost { "${_domain}-redirect":
        ensure               => present,
        location_custom_cfg => {
          'return' => 'https://$host$request_uri',
        },
      }
    }
  }
}

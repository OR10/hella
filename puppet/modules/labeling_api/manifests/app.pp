class labeling_api::app(
  $www_root,
  $cache_dir = $labeling_api::params::cache_dir,
  $configure_nginx = $labeling_api::params::configure_nginx,
  $app_main_script = 'app.php',
  $labeling_ui_dir = '/var/www/labeling-ui',
  $client_max_body_size = '512M',
  $is_vagrant_vm = false,
  $port = 80,
  $httpv2 = false,
  $sslCertFile = undef,
  $sslKeyFile = undef,
  $listenIp = '*',
  $symfonyUser = undef,
  $symfonyRoot,
  $symfonyEnvironment = 'prod',
) {
  include ::labeling_api::common

  if $labeling_api::params::frame_cdn_type == 's3-cmd' {
    ensure_packages(['s3cmd', 'parallel'])
  }

  if $symfonyUser == undef {
    $_symfonyUser = hiera('php::fpm::pools')['www']['user']
  } else {
    $_symfonyUser = $symfonyUser
  }

  ::annostation_base::symfony { 'labeling_api':
    www_root => $www_root,
    configure_nginx => $configure_nginx,
    app_main_script => $app_main_script,
    client_max_body_size => $client_max_body_size,
    port => $port,
    httpv2 => $httpv2,
    sslCertFile => $sslCertFile,
    sslKeyFile => $sslKeyFile,
    not_found_redirect => '/labeling/index.html',
    listenIp => $listenIp,
  }

  if $configure_nginx {
    $_uiLocationCfgAppend = {
      try_files => '$uri /labeling/index.html',
    }

    if $::labeling_api::params::couchdb_password {
      ensure_packages(['dnsmasq'])
      nginx::resource::location { '~ /couchdb/(.*)':
        ssl                   => $httpv2,
        ssl_only              => $httpv2,
        ensure                => present,
        vhost                 => 'labeling_api',
        location_cfg_prepend  => {
          resolver   => '127.0.0.1 ipv6=off',
          'set $url' => "\"${::labeling_api::params::couchdb_host}\"",
        },
        proxy                 => "http://\$url:${::labeling_api::params::couchdb_port}/\$1\$is_args\$args",
        proxy_read_timeout    => '1800',
        proxy_connect_timeout => '90',
        proxy_redirect        => 'off',
        proxy_set_header      => ['Host $host'],
      }
    }

    nginx::resource::location { '/labeling':
      ssl                 => $httpv2,
      ssl_only            => $httpv2,
      ensure              => present,
      vhost               => 'labeling_api',
      location_alias      => $labeling_ui_dir,
      location_cfg_append => $_uiLocationCfgAppend,
    }
  }

  if $is_vagrant_vm {
    file { $labeling_ui_dir:
      ensure => 'link',
      target => '/labeling-ui/Distribution',
    }
  }

  file { '/etc/cron.d/remove-expired-user-assignments-and-memberships':
    ensure  => present,
    content => "0 1 * * * ${_symfonyUser} ${symfonyRoot}/app/AnnoStation/console annostation:remove-expired-user-assignments-and-memberships --env=${symfonyEnvironment}",
    mode    => '644',
  }

  file { '/etc/cron.d/rabbitmq-rescheduler':
    ensure  => present,
    content => template('labeling_api/cronjob/rescheduler.erb'),
    mode    => '644',
  }

  file { '/etc/cron.d/couchdb-maintenance':
    ensure  => present,
    content => template('labeling_api/cronjob/couchdb_maintenance.erb'),
    mode    => '644',
  }
}

class { 'apt':
  update => {
    frequency => 'daily',
  },
}

class { 'nginx': }

include php
ensure_packages(["software-properties-common"])

nginx::resource::vhost { "_":
  ensure              => present,
  www_root            => "/vagrant/web",
  index_files     => ['app_dev.php'],
  fastcgi     => '127.0.0.1:9000',
  try_files   => ['$uri', '/app.php$is_args$args'],
}

exec { 'composer-install-labelstation':
  command => '/usr/local/bin/composer install --no-interaction',
  cwd     => '/vagrant',
  creates => '/vagrant/vendor',
  require => Class['php::composer'],
}




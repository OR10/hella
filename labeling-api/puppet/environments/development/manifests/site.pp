class { 'nginx': }

include php
ensure_packages(["software-properties-common"])

nginx::resource::vhost { "_":
  ensure      => present,
  www_root    => "/vagrant/web",
  index_files => ['app_dev.php'],
  try_files   => ['$uri', '$uri/', '=404'],
}

nginx::resource::location { '~ \.php(/|$)':
  ensure        => present,
  www_root      => "/vagrant/web",
  vhost         => '_',
  index_files   => ['app_dev.php'],
  fastcgi       => '127.0.0.1:9000',
  fastcgi_param => {
      'SCRIPT_FILENAME' => '$document_root$fastcgi_script_name',
  },
}

exec { 'composer-install-labelstation':
  command => '/usr/local/bin/composer install --no-interaction',
  cwd     => '/vagrant',
  creates => '/vagrant/vendor',
  require => Class['php::composer'],
}

class { '::mysql::server':
  root_password           => 'xohx6aeS',
  remove_default_accounts => true,
  override_options        => {
      'mysqld' => {
          'bind-address' => '0.0.0.0',
      }
  }
}

::mysql::db { 'labeling_api':
    user     => 'labeling_api',
    password => 'pEid4oShu',
    host     => '%',
}

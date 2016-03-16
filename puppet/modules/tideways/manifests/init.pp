class tideways(
  $php7 = false,
) {
  if $php7 {
    $_packages = [
      'tideways-daemon',
    ]
  } else {
    $_packages = [
      'tideways-php',
      'tideways-daemon',
    ]
  }

  apt::source { 'tideways':
    location => 'http://s3-eu-west-1.amazonaws.com/qafoo-profiler/packages',
    release => 'debian',
    repos => 'main',
    key => {
      id => '6A75A7C5E23F3B3B6AAEEB1411CD8CFCEEB5E8F4',
      source => 'https://s3-eu-west-1.amazonaws.com/qafoo-profiler/packages/EEB5E8F4.gpg',
    }
  }

  package { $_packages:
    ensure => present,
    require => Apt::Source['tideways'],
  }

  if $php7 {
    file { '/tmp/tideways-php_4.0.1_amd64.deb':
      ensure => file,
      source => 'puppet:///modules/tideways/tideways-php_4.0.1_amd64.deb',
    }

    package { 'tideways-php':
      ensure => installed,
      provider => dpkg,
      source => '/tmp/tideways-php_4.0.1_amd64.deb',
      require => [
        File['/tmp/tideways-php_4.0.1_amd64.deb'],
        Package[$_packages],
      ],
    }

    file { '/etc/php/7.0/mods-available/tideways.ini':
      ensure => link,
      target => '/etc/php5/mods-available/tideways.ini',
      require => Package['tideways-php'],
    }

    file { ['/etc/php/7.0/cli/conf.d/20-tideways.ini', '/etc/php/7.0/fpm/conf.d/20-tideways.ini']:
      ensure => link,
      target => '/etc/php/7.0/mods-available/tideways.ini',
      require => File['/etc/php/7.0/mods-available/tideways.ini'],
      notify => Service[$::php::fpm::service::service_name],
    }
  }
}

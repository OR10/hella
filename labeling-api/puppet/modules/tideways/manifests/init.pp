class tideways(
) {
  apt::source { 'tideways':
    location => 'http://s3-eu-west-1.amazonaws.com/qafoo-profiler/packages',
    release => 'debian',
    repos => 'main',
    key => {
      id => '6A75A7C5E23F3B3B6AAEEB1411CD8CFCEEB5E8F4',
      source => 'https://s3-eu-west-1.amazonaws.com/qafoo-profiler/packages/EEB5E8F4.gpg',
    }
  }

  $packages = [
    'tideways-php',
    'tideways-daemon',
  ]

  package { $packages:
    ensure => present,
    require => Apt::Source['tideways'],
  }
}

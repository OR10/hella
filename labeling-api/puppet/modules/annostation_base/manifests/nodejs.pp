class annostation_base::nodejs() {
  class { 'nodejs':
  }

  $packages = [
    'libcairo2-dev',
    'libjpeg8-dev',
    'libpango1.0-dev',
    'libgif-dev',
    'build-essential',
  ]

  package { $packages:
    ensure => present,
  }

  ensure_packages([
    'jspm',
    'gulp',
    'aglio',
  ], {
    provider => 'npm',
    require => [
      Package['npm'],
      Package[$packages],
    ]
  })
}

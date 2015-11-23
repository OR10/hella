class annostation_base::nodejs() {
  class { 'nodejs':
  }

  package { 'g++':
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
      Package['g++'],
    ]
  })
}

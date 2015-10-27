class annostation_base::nodejs() {
  class { 'nodejs':
  }

  ensure_packages([
    'jspm',
    'gulp',
    'aglio',
  ], {
    provider => 'npm',
    require => Package['npm'],
  })
}

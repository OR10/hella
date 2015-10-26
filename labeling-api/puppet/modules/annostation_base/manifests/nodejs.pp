class annostation_base::nodejs() {
  class { 'nodejs':
  }

  ensure_packages([
    'jspm',
    'gulp',
  ], {
    provider => 'npm',
    require => Package['npm'],
  })
}

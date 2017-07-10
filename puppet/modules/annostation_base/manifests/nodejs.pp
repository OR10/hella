class annostation_base::nodejs(
  $nvmUser,
) {
  apt::key { 'yarn':
    id     => '72ECF46A56B4AD39C907BBB71646B01B86E50310',
    source => 'https://dl.yarnpkg.com/debian/pubkey.gpg',
  }

  apt::source { 'yarn':
    location => 'https://dl.yarnpkg.com/debian',
    repos    => 'main',
    release  => 'stable',
    require  => Apt::Key['yarn'],
  }

  package { 'yarn':
    require => Apt::Source['yarn'],
  }

  class { 'nodejs':
  }

  class { 'nvm':
    install_node        => '8',
    manage_dependencies => false,
    user                => $nvmUser,
  }

  Package['git'] -> Class['nvm::install']

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
	'protagonist',
    'aglio',
  ], {
    provider => 'npm',
    require => [
      Package['npm'],
      Package[$packages],
    ]
  })
}

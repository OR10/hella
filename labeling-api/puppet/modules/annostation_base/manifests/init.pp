class annostation_base(
  $nodejs = false,
) {
    if $nodejs {
      include ::annostation_base::nodejs
    }

    $packages = [
        'git',
        'htop',
        'libav-tools',
        'vim',
    ]

    package { $packages:
        ensure => present,
    }
}

class annostation_base(
  $nodejs = false,
  $authorized_keys = false,
) {
    if $nodejs {
      include ::annostation_base::nodejs
    }

    if $authorized_keys {
      include ::annostation_base::authorized_keys
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

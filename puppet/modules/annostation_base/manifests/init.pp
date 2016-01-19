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

    file { "/etc/apt/apt.conf.d/99auth":
      owner     => root,
      group     => root,
      content   => "APT::Get::AllowUnauthenticated yes;",
      mode      => '644',
    }

    $packages = [
        'ant',
        'git',
        'htop',
        'libav-tools',
        'vim',
    ]

    package { $packages:
        ensure => present,
    }

    file { '/etc/localtime':
        ensure => 'link',
        target => '/usr/share/zoneinfo/Europe/Berlin',
    }
}

class annostation_base() {

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

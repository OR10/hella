class annostation_base() {

    $packages = [
        'git',
        'htop',
        'vim',
    ]

    package { $packages:
        ensure => present,
    }
}

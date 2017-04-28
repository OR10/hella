class annostation_base(
  $nodejs = false,
  $authorized_keys = false,
  $github_tokens = false,
  $jenkins_slave = false,
  $docker = false,
  $symfonyUser = undef,
  $symfonyRoot,
) {
    if $symfonyUser == undef {
      $_symfonyUser = hiera('php::fpm::pools')['www']['user']
    } else {
      $_symfonyUser = $symfonyUser
    }

    if $nodejs {
      include ::annostation_base::nodejs
    }

    if $authorized_keys {
      include ::annostation_base::authorized_keys
    }

    if $github_tokens {
      include ::annostation_base::github_tokens
    }

    if $jenkins_slave {
      include ::annostation_base::jenkins_slave
    }

    if $docker {
      include ::annostation_base::docker
    }

    exec { 'locale-gen de_DE.UTF-8':
      path => ['/bin', '/sbin', '/usr/bin', '/usr/sbin'],
    }

    file { "/etc/apt/apt.conf.d/99auth":
      owner     => root,
      group     => root,
      content   => "APT::Get::AllowUnauthenticated yes;",
      mode      => '644',
    }

    $packages = [
        'ack-grep',
        'ant',
        'curl',
        'git',
        'htop',
        'libav-tools',
        'logrotate',
        'openjdk-7-jdk',
        'tree',
        'unzip',
        'vim',
    ]

    package { $packages:
        ensure => present,
    }

    file { '/etc/localtime':
        ensure => 'link',
        target => '/usr/share/zoneinfo/Europe/Berlin',
    }

    # remove some obsolete files
    # this may be removed once all vms were migrated
    $_obsoleteFiles = [
      '/etc/nginx/cdn-cors.conf',
      '/etc/nginx/sites-available/_.conf',
      '/etc/nginx/sites-enabled/_.conf',
      '/etc/nginx/sites-available/cdn.conf',
      '/etc/nginx/sites-enabled/cdn.conf',
    ]

    file { $_obsoleteFiles:
      ensure => absent,
    }

    file { '/etc/inputrc':
      ensure => present,
      source => 'puppet:///modules/annostation_base/inputrc',
    }

    file { '/etc/cron.d/remove-expired-user-assignments-and-memberships':
          ensure  => present,
          content => "0 1 * * * ${_symfonyUser} ${symfonyRoot}/app/AnnoStation/console annostation:remove-expired-user-assignments-and-memberships",
          mode    => '644',
        }
}

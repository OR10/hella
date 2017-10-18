# Installs a couchdb on an ubuntu box.
# Also manages the service and creates a replication management script
class couchdb (
  $data_dir_prefix = '/stor',
  $bind_address = '0.0.0.0',
  $cors_credentials = false,
  $cors_origins = undef,
  $cors_methods = 'GET',
  $cors_headers = undef,
  $admin_username = 'admin',
  $admin_password = undef,
  $admin_salt = undef,
  $require_valid_user = false,
) {
  case $::operatingsystem {
    ubuntu, debian: {
      $package_name = 'couchdb'
      $service_name = 'couchdb'
      $data_dir     = "${data_dir_prefix}/couchdb"
    }
    default: {
      fail("The couchdb module does not work on ${::operatingsystem}.")
    }
  }

  $couchdb_ip_address = $bind_address

  if $admin_password {
    $couchdb_authentication = join([uriescape($admin_username), ':', uriescape($admin_password), '@'], '')
  } else {
    $couchdb_authentication = ""
  }

  file { '/etc/couchdb/local.d/crosscan.ini':
    ensure  => file,
    notify  => Service[$service_name],
    content => template('couchdb/local.ini.erb'),
    require => Package[$package_name],
  }

  file { '/etc/couchdb/local.d/zzzz-uuid.ini':
    ensure  => present,
    owner   => 'couchdb',
    notify  => Service[$service_name],
    require => Package[$package_name],
  }

  file { $data_dir:
      ensure  => directory,
      owner   => 'couchdb',
      recurse => true,
      notify  => Service[$service_name],
      require => Package[$package_name],
  }

  if $data_dir != '/var/lib/couchdb' {
    file { '/var/lib/couchdb':
        ensure  => link,
        notify  => Service[$service_name],
        require => [Package[$package_name], File[$data_dir]],
        target  => $data_dir,
        force   => true,
    }
  }

  package { $package_name:
      ensure => latest,
  }

  service { $service_name:
      ensure   => running,
      enable   => true,
      provider => 'upstart',
  }

  file { '/etc/logrotate.d/couchdb':
      ensure => file,
      source => 'puppet:///modules/couchdb/logrotate.conf',
  }

  file { '/usr/local/bin/couchdb_replication':
    ensure => file,
    mode   => '0755',
    source => 'puppet:///modules/couchdb/couchdb_replication.php',
  }

  if($::operatingsystem == 'ubuntu' or $::operatingsystem == 'Ubuntu') {
    # This is a workarounbd
    exec { 'remove_couchdb_init_script':
      command => '/etc/init.d/couchdb stop; killall -u couchdb; rm /etc/init.d/couchdb',
      onlyif  => '/usr/bin/test -e /etc/init.d/couchdb',
      require => Package[$package_name],
      before  => Service[$service_name],
    }

    # Turned this of, should now be handled by the upstart script
    # file { '/var/run/couchdb/':
    #   ensure  => directory,
    #   owner   => 'couchdb',
    #   before  => Service[$service_name],
    #   require => Package[$package_name]
    # }

    file { '/etc/init/couchdb.conf':
      ensure => present,
      source => 'puppet:///modules/couchdb/upstart.conf',
      before => Service[$service_name]
    }

    file_line { '/etc/pam.d/sudo':
      path    => '/etc/pam.d/sudo',
      line    => 'session    required   pam_limits.so',
      match   => '^\s*session',
      require => Package[$package_name],
      notify  => Service[$service_name],
    }
  }

  if $admin_password {
    if ! $admin_username {
      fail('admin username required')
    }

    if ! $admin_salt {
      fail('salt for admin password required')
    }

    $_admin_password_hash = sha1("${admin_password}${admin_salt}")

    file { '/etc/couchdb/local.d/crosscan-admins.ini':
      ensure  => file,
      notify  => Service[$service_name],
      content => template('couchdb/admins.ini.erb'),
      require => Package[$package_name],
    }
  }
}

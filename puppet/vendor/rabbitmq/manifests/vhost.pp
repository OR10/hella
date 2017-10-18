define rabbitmq::vhost(
  $user = undef,
  $confPermission = '.*',
  $writePermission = '.*',
  $readPermission = '.*',
) {
  exec { "rabbitmq-vhost-${name}":
    command => "rabbitmqctl add_vhost '${name}'",
    path    => ['/usr/bin', '/usr/sbin', '/bin', '/sbin'],
    unless  => "rabbitmqctl list_vhosts | grep '${name}'",
    require => Package[$rabbitmq::package_name],
  }

  if $user {
    rabbitmq::permission { "${name}-${user}":
      user  => $user,
      vhost => $name,
      conf  => $confPermission,
      write => $writePermission,
      read  => $readPermission,
    }
  }
}

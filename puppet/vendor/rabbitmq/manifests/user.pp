define rabbitmq::user(
  $password,
) {
  exec { "rabbitmq-user-${name}":
    command => "rabbitmqctl add_user '${name}' '${password}'",
    path    => ['/usr/bin', '/usr/sbin', '/bin', '/sbin'],
    unless  => "rabbitmqctl list_users | grep '${name}'",
    require => Package[$rabbitmq::package_name],
  }
}

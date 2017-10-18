define rabbitmq::permission(
  $user,
  $vhost = '/',
  $conf = '.*',
  $write = '.*',
  $read = '.*',
) {
  exec { "rabbitmq-permissions-${user}-${vhost}":
    command => "rabbitmqctl set_permissions -p '${vhost}' '${user}' '${conf}' '${write}' '${read}'",
    unless  => "/bin/bash -c 'read user p_conf p_write p_read <<<$(rabbitmqctl list_permissions -p \"${vhost}\" | grep \"${user}\") && [ \"\$p_conf\" = \"${conf}\" ] && [ \"\$p_write\" = \"${write}\" ] && [ \"\$p_read\" = \"${read}\" ]'",
    path    => ['/usr/bin', '/usr/sbin', '/bin', '/sbin'],
    require => Package[$rabbitmq::package_name],
  }
}

# == Class: rabbitmq:join_cluster
#
# Adds a node to an rabbitmq cluster.
#
# === Parameters
#
# [*cluster_host*]
#   The host at which the cluster can be reached.
#
# === Examples
#
#  class { 'rabbitmq::join_cluster':
#    cluster_host     => '172.31.10.3',
#  }
#
# === Copyright
#
# Copyright 2013 crosscan GmbH
#
class rabbitmq::join_cluster (
  $cluster_host,
) {
  $rabbitMqCli       = '/usr/sbin/rabbitmqctl'
  $stopAppString     = "${rabbitMqCli} stop_app"
  $startAppString    = "${rabbitMqCli} start_app"
  $joinClusterString = "${rabbitMqCli} join_cluster rabbit@${cluster_host}"

  if($cluster_host != $::fqdn 
and
 $cluster_host != $::hostname and
 $cluster_host != $::ipaddress_eth0 and
 ($::ipaddress_eth1 == undef or $::ipaddress_eth1 != $cluster)) {
  exec {'join-rabbitmq-cluster':
    command => "${stopAppString} && ${joinClusterString} &&  ${startAppString}",
    onlyif  => "/usr/sbin/rabbitmqctl cluster_status | /bin/grep -E '^\\[{nodes,\\[{disc,\\[rabbit@${::hostname}\\]}\\]}(,|\\])$'",
    require => [
      Exec['set-rabbitmq-erlang-cookie-and-restart-rabbitmq'],
      Exec['set-rabbitmq-erlang-cookie']
    ]
  }
}
}

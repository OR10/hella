# == Class: rabbitmq:custom_datadir
#
# Changes the path to the rabbitmq data dir.
#
# === Parameters
#
# [*datadir*]
#   The datadir to use. Puppet will create it and configure rabbitmq to use it.
#
# === Examples
#
#  class { 'rabbitmq::custom_datadir':
#    datadir => '/stor/rabbitmq'
#  }
#
# === Copyright
#
# Copyright 2014 crosscan GmbH
#
class rabbitmq::custom_datadir (
  $datadir = '/stor/rabbitmq'
){

  file { $datadir:
    ensure  => directory,
    owner   => 'rabbitmq',
    group   => 'rabbitmq',
    mode    => '0750',
  }

  file { '/etc/rabbitmq/rabbitmq.conf.d/mnesia.conf':
    ensure  => present,
    content => "MNESIA_BASE=${datadir}",
    require => [Package['rabbitmq-server'], File[$datadir]],
    before  => Service['rabbitmq-server'],
    notify  => Service['rabbitmq-server'],
  }
}

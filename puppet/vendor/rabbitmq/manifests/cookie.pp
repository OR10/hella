# == Class: rabbitmq:cookie
#
# Changes the erlang cookie of this rabbitmq server.
# This is a bit more complicated as expected, as the cookie has to be changed
# while rabbitmq is not running.
#
# === Parameters
#
# [*erlangCookie*]
#   The erlang cookie that should be used :)
#
# === Examples
#
#  class { 'rabbitmq::cookie':
#    erlangCookie => 'foobar'
#  }
#
# === Copyright
#
# Copyright 2013 crosscan GmbH
#
class rabbitmq::cookie (
  $erlangCookie = 'KITSVFQREKVSJVFBVEIR'
){
  $cookieFile = '/var/lib/rabbitmq/.erlang.cookie'
  $tmpCookieFile = '/var/lib/rabbitmq/.erlang.cookie.managed.by.puppet'

  $rabbitmqctl = '/usr/sbin/rabbitmqctl'

  $initScript  = '/usr/sbin/service rabbitmq-server'
  $status      = "${initScript} status"
  $start       = "${initScript} start"
  $stop        = "${initScript} stop"
  $copyCookie  = "/bin/cp ${tmpCookieFile} ${cookieFile}"

  file { $tmpCookieFile:
    ensure  => present,
    content => $erlangCookie,
    owner   => 'rabbitmq',
    group   => 'rabbitmq',
    mode    => '0400',
    require => Package[$::rabbitmq::package_name],
  }

  exec {'set-rabbitmq-erlang-cookie-and-restart-rabbitmq':
    onlyif  => "${status}",
    unless  => "/usr/bin/cmp ${cookieFile} ${tmpCookieFile}",
    command => "${stop} && ${copyCookie} && ${start}",
    require => File[$tmpCookieFile],
    before  => Service[$::rabbitmq::service_name],
  }

  exec {'set-rabbitmq-erlang-cookie':
    unless  => "/usr/bin/cmp ${cookieFile} ${tmpCookieFile} || ${status}",
    command => "${copyCookie}",
    require => File[$tmpCookieFile],
    before  => Service[$::rabbitmq::service_name],
  }
}

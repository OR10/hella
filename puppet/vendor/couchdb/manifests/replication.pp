# == Define: couchdb::replication
#
# Configures a persistent, continuous couchdb replication.
#
# === Parameters
#
# Document parameters here
#
# [*namevar*]
#   The namevar of this resource does not have any function.
#   There might be two replications with different names that this defined
#   type treats as the same replication. It identifies the replications by
#   their source and target. Thus, if you got two replications with the exact
#   same source and target, they will actualy be the same. This should not be
#   an issue in production environments.
#
# [*host*]
#   This parameter configures the couchdb on which the replication is setup.
#   Defaults to localhost:5984, which should work in almost every situation.
#
# [*source*]
#   This parameter sets the source database. 
#   Enter full path, e.g. http://somehost:5984/foobar
#
# [*host*]
#   This parameter sets the target database. 
#   Enter full path, e.g. http://somehost:5984/foobar
#
# === Examples
#
# The replication can be used as following:
#
#   couchdb::replication { 'logger':
#     ensure => present,
#     source => 'http://localhost:5986/newlogs',
#     target => 'http://localhost:5984/newlogs',
#   }
#   example_class::example_resource { 'namevar':
#     basedir => '/tmp/src',
#   }
#
# === Authors
#
# Hans-Christian Otto <cho@crosscan.com>
#
# === Copyright
#
# Copyright 2013 crosscan GmbH
#
define couchdb::replication (
  $ensure = present,
  $host   = "localhost:5984",
  $source,
  $target
) {
  include couchdb

  Exec {
    require => [
      Service[$::couchdb::package_name],
      File['/usr/local/bin/couchdb_replication'],
    ],
  }

  $parameters = "${host} ${source} ${target}"


  case ($ensure) {
    "present" : {
      exec { "create_couchdb_replication_${name}":
        unless  => "/usr/local/bin/couchdb_replication exists ${parameters}",
        command => "/usr/local/bin/couchdb_replication add ${parameters}",
      }
    }

    "absent"  : {
      exec { "remove_couchdb_replication_${name}":
        onlyif  => "/usr/local/bin/couchdb_replication exists ${parameters}",
        command => "/usr/local/bin/couchdb_replication remove ${parameters}",
      }
    }

    default   : {
      fail("Can't set ensure of couchdb::replication to ${ensure}.")
    }
  }
}
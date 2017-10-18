define couchdb::database (
  $ensure = "present",
  $admins = [],
  $admin_roles = [],
  $members = [],
  $member_roles = [],
) {
  include couchdb

  Exec {
    require => Service[$::couchdb::service_name],
  }

  if size($admins) > 0 {
    $_admins = join(['"', join($admins, '","'), '"'], '')
  } else {
    $_admins = ''
  }

  if size($admin_roles) > 0 {
    $_admin_roles = join(['"', join($admin_roles, '","'), '"'], '')
  } else {
    $_admin_roles = ''
  }

  if size($members) > 0 {
    $_members = join(['"', join($members, '","'), '"'], '')
  } else {
    $_members = ''
  }

  if size($member_roles) > 0 {
    $_member_roles = join(['"', join($member_roles, '","'), '"'], '')
  } else {
    $_member_roles = ''
  }

  case ($ensure) {
    "present" : {
      exec { "create_couchdb_database_${name}":
        unless  => "/usr/bin/curl --silent --fail http://${::couchdb::couchdb_authentication}localhost:5984/${name}",
        command => "/usr/bin/curl --silent --fail -X PUT http://${::couchdb::couchdb_authentication}localhost:5984/${name}",
        notify  => Exec["secure_couchdb_database_${name}"],
      }

      exec { "secure_couchdb_database_${name}":
        command     => "/usr/bin/curl --silent --fail -X PUT http://${::couchdb::couchdb_authentication}localhost:5984/${name}/_security -d '{\"admins\": {\"names\": [${_admins}], \"roles\": [${_admin_roles}]}, \"members\": {\"names\": [${_members}], \"roles\": [${_member_roles}]}}'",
        refreshonly => true,
      }
    }

    "absent"  : {
      fail("Deleting couchdb databases is currently not supported.")

      # exec { "create_couchdb_database_${name}":
      #  onlyif  => "/usr/bin/curl --silent --fail http://${::couchdb::couchdb_authentication}localhost:5984/${name}",
      #  command => "/usr/bin/curl --silent --fail -X DELETE http://${::couchdb::couchdb_authentication}localhost:5984/${name}",
      #}
    }

    default   : {
      fail("Can't set ensure of couchdb::database to ${ensure}.")
    }
  }
}

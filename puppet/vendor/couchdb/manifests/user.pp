define couchdb::user (
  $ensure = "present",
  $password,
) {
  include couchdb

  Exec {
    require => Service[$::couchdb::service_name],
  }

  case ($ensure) {
    "present" : {
      exec { "create_couchdb_user_${name}":
        unless  => "/usr/bin/curl --silent --fail http://${::couchdb::couchdb_authentication}localhost:5984/_users/org.couchdb.user:${name}",
        command => "/usr/bin/curl --silent --fail -X PUT http://${::couchdb::couchdb_authentication}localhost:5984/_users/org.couchdb.user:${name} -d '{\"_id\": \"org.couchdb.user:${name}\", \"type\": \"user\", \"name\": \"${name}\", \"password\": \"${password}\", \"roles\": []}'",
      }
    }

    "absent"  : {
      fail("Deleting couchdb users is currently not supported.")

      # the following does not work because of the missing revision but is left here as a hint if somebody has the time and effort to implement it
      #exec { "delete_couchdb_user_${name}":
      #  onlyif  => "/usr/bin/curl --silent --fail http://${::couchdb::couchdb_authentication}localhost:5984/_users/org.couchdb.user:${name}",
      #  command => "/usr/bin/curl --silent --fail -X DELETE http://${::couchdb::couchdb_authentication}localhost:5984/_users/org.couchdb.user:${name}",
      #}
    }

    default   : {
      fail("Can't set ensure of couchdb::user to ${ensure}.")
    }
  }
}

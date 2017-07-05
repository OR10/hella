class labeling_api::worker(
  $app_dir,
  $user,
  $numberOfLowNormalWorkers = 8,
  $numberOfHighNormalWorkers = 2,
  $symfony_environment = 'prod',
  $autostart = true,
) {
  include ::php
  include ::annostation_base::supervisord
  include ::labeling_api::common

  supervisord::program { 'worker-pool-starter-low-normal':
    command => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter low normal",
    autostart => $autostart,
    autorestart => true,
    user => $user,
    directory => $app_dir,
    startsecs => 0,
    numprocs => $numberOfLowNormalWorkers,
    environment => {
        'SYMFONY_ENV' => $symfony_environment,
    },
    notify => Exec['restart supervisord'],
  }

  supervisord::program { 'worker-pool-starter-high-normal':
    command => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter high normal",
    autostart => $autostart,
    autorestart => true,
    user => $user,
    directory => $app_dir,
    startsecs => 0,
    numprocs => $numberOfHighNormalWorkers,
    environment => {
        'SYMFONY_ENV' => $symfony_environment,
    },
    notify => Exec['restart supervisord'],
  }

  if ($labeling_api::params::couchdb_standby_host and $labeling_api::params::couchdb_standby_port and $labeling_api::params::couchdb_standby_user and $labeling_api::params::couchdb_standby_password) {
    $replicationCommand = "node ${app_dir}/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl 'http://${labeling_api::params::couchdb_user}:${labeling_api::params::couchdb_password}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --targetBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceDbRegex '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)' --targetDb '${labeling_api::params::database_name_read_only}' --hotStandByUrl 'http://${labeling_api::params::couchdb_standby_user}:${labeling_api::params::couchdb_standby_password}@${labeling_api::params::couchdb_standby_host}:${labeling_api::params::couchdb_standby_port}/'"
  } else {
    $replicationCommand = "node ${app_dir}/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl 'http://${labeling_api::params::couchdb_user}:${labeling_api::params::couchdb_password}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --targetBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceDbRegex '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)' --targetDb '${labeling_api::params::database_name_read_only}'"
  }
  supervisord::program { 'annostation-couchdb-replication-labeling-api-to-task-databases':
    command => $replicationCommand,
    autostart => $autostart,
    autorestart => true,
    user => $user,
    directory => $app_dir,
    startsecs => 0,
    numprocs => 1,
    environment => {
        'SYMFONY_ENV' => $symfony_environment,
    },
    notify => Exec['restart supervisord'],
  }
}

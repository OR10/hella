class labeling_api::worker(
  $app_dir,
  $user,
  $numberOfLowNormalWorkers = 8,
  $numberOfHighNormalWorkers = 2,
  $symfony_environment = 'prod',
) {
  include ::php
  include ::annostation_base::supervisord
  include ::labeling_api::common

  supervisord::program { 'worker-pool-starter-low-normal':
    command => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter low normal",
    autostart => true,
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
    autostart => true,
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

  if $labeling_api::params::pouchdb_feature_enabled {
    supervisord::program { 'annostation-couchdb-replication-labeling-api-to-task-databases':
      command => "node ${app_dir}/scripts/CouchDB/ReplicatorManager/ReplicationManager.js ${labeling_api::params::couchdb_host} ${labeling_api::params::couchdb_port} '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)' 'labeling_api'",
      autostart => true,
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
}

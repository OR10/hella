class labeling_api::worker(
  $app_dir,
  $user,
  $numberOfLowWorkers = 1,
  $numberOfNormalWorkers = 4,
  $numberOfHighWorkers = 2,
  $numberOfNormalLowWorkers = 4,
  $symfony_environment = 'prod',
  $autostart = true,
) {
  include ::php
  include ::annostation_base::supervisord
  include ::labeling_api::common

  supervisord::program { 'annostation-worker-pool-starter-low':
    command             => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter low",
    autostart           => $autostart,
    autorestart         => true,
    user                => $user,
    directory           => $app_dir,
    startsecs           => 0,
    numprocs            => $numberOfLowWorkers,
    stopasgroup         => true,
    program_environment => {
        'SYMFONY_ENV'   => $symfony_environment,
    },
    notify              => Exec['restart supervisord'],
  }

  supervisord::program { 'annostation-worker-pool-starter-normal':
    command             => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter normal",
    autostart           => $autostart,
    autorestart         => true,
    user                => $user,
    directory           => $app_dir,
    startsecs           => 0,
    numprocs            => $numberOfNormalWorkers,
    stopasgroup         => true,
    program_environment => {
        'SYMFONY_ENV'   => $symfony_environment,
    },
    notify              => Exec['restart supervisord'],
  }

  supervisord::program { 'annostation-worker-pool-starter-high':
    command             => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter high",
    autostart           => $autostart,
    autorestart         => true,
    user                => $user,
    directory           => $app_dir,
    startsecs           => 0,
    numprocs            => $numberOfHighWorkers,
    stopasgroup         => true,
    program_environment => {
        'SYMFONY_ENV'   => $symfony_environment,
    },
    notify              => Exec['restart supervisord'],
  }

  supervisord::program { 'annostation-worker-pool-starter-normal-low':
    command             => "${app_dir}/app/AnnoStation/console annostation:workerpool:starter normal low",
    autostart           => $autostart,
    autorestart         => true,
    user                => $user,
    directory           => $app_dir,
    startsecs           => 0,
    numprocs            => $numberOfNormalLowWorkers,
    stopasgroup         => true,
    program_environment => {
        'SYMFONY_ENV'   => $symfony_environment,
    },
    notify              => Exec['restart supervisord'],
  }

  supervisord::group { 'annostation-worker-pool':
    priority => 100,
    programs => [
        'annostation-worker-pool-starter-low',
        'annostation-worker-pool-starter-normal',
        'annostation-worker-pool-starter-high',
        'annostation-worker-pool-starter-normal-low'
    ]
  }

  if ($labeling_api::params::couchdb_standby_host and $labeling_api::params::couchdb_standby_port and $labeling_api::params::couchdb_standby_user and $labeling_api::params::couchdb_standby_password) {
    $replicationCommand = "bash ${app_dir}/scripts/CouchDB/ReplicatorManager/supervisor-run.sh --adminUrl 'http://${labeling_api::params::couchdb_user}:${labeling_api::params::couchdb_password}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --targetBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceDbRegex '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)' --targetDb '${labeling_api::params::database_name_read_only}' --hotStandByUrl 'http://${labeling_api::params::couchdb_standby_user}:${labeling_api::params::couchdb_standby_password}@${labeling_api::params::couchdb_standby_host}:${labeling_api::params::couchdb_standby_port}/'"
  } else {
    $replicationCommand = "bash ${app_dir}/scripts/CouchDB/ReplicatorManager/supervisor-run.sh --adminUrl 'http://${labeling_api::params::couchdb_user}:${labeling_api::params::couchdb_password}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --targetBaseUrl 'http://${labeling_api::params::couchdb_user_read_only}:${labeling_api::params::couchdb_password_read_only}@${labeling_api::params::couchdb_host}:${labeling_api::params::couchdb_port}/' --sourceDbRegex '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)' --targetDb '${labeling_api::params::database_name_read_only}'"
  }
  supervisord::program { 'annostation-couchdb-replication-labeling-api-to-task-databases':
    command             => $replicationCommand,
    autostart           => $autostart,
    autorestart         => true,
    user                => $user,
    directory           => "${app_dir}/scripts/CouchDB/ReplicatorManager/",
    startsecs           => 0,
    numprocs            => 1,
    stopasgroup         => true,
    program_environment => {
        'SYMFONY_ENV'   => $symfony_environment,
        'USER'          => $user,
    },
    notify              => Exec['restart supervisord'],
  }
}

class labeling_api::worker(
  $app_dir,
  $user,
  $numberOfLowNormalWorkers = 8,
  $numberOfHighNormalWorkers = 2,
) {

  supervisord::program { 'worker-pool-starter-low-normal':
    command => "${app_dir}/app/console annostation:workerpool:starter low normal",
    autostart => true,
    autorestart => true,
    user => $user,
    directory => $app_dir,
    startsecs => 0,
    numprocs => $numberOfLowNormalWorkers,
  }

  supervisord::program { 'worker-pool-starter-high-normal':
    command => "${app_dir}/app/console annostation:workerpool:starter high normal",
    autostart => true,
    autorestart => true,
    user => $user,
    directory => $app_dir,
    startsecs => 0,
    numprocs => $numberOfHighNormalWorkers,
  }

}

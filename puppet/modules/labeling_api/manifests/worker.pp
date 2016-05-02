class labeling_api::worker(
  $app_dir,
  $user,
  $numberOfLowNormalWorkers = 8,
  $numberOfHighNormalWorkers = 2,
  $symfony_environment = 'prod',
) {
  include ::php
  include ::supervisord
  include ::labeling_api::common

  package { 'python-pip':
    ensure => present,
    before => Exec['install_setuptools'],
  }

  supervisord::program { 'worker-pool-starter-low-normal':
    command => "${app_dir}/app/console annostation:workerpool:starter low normal",
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
    command => "${app_dir}/app/console annostation:workerpool:starter high normal",
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

  exec { 'restart supervisord':
    refreshonly => true,
    command => 'service supervisord restart',
    path => '/bin:/usr/bin:/sbin:/usr/sbin',
    user => 'root',
  }
}

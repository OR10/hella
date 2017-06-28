define workerpool::worker(
  $symfonyRoot,
  $symfonyUser,
  $symfonyEnvironment = 'prod',
  $symfonyConsole = 'bin/console',
  $starterCommand = 'hagl:workerpool:starter',
  $reschedulerCommand = 'hagl:workerpool:rescheduler',
  $numberOfLowNormalWorkers = 0,
  $numberOfNormalLowWorkers = 1,
  $numberOfHighNormalWorkers = 1,
  $numberOfHighWorkers = 0,
  $autostart = true,
) {
  $_worker = {
    'low-normal'    => {
        'arguments' => 'low normal',
        'count'     => $numberOfLowNormalWorkers,
    },
    'normal-low'    => {
        'arguments' => 'normal low',
        'count'     => $numberOfNormalLowWorkers,
    },
    'high-normal'   => {
        'arguments' => 'high normal',
        'count'     => $numberOfHighNormalWorkers,
    },
    'high'          => {
        'arguments' => 'high',
        'count'     => $numberOfHighWorkers,
    },
  }

  $_worker.each |$workerName, $workerOptions| {
    if $workerOptions['count'] > 0 {
      supervisord::program { "workerpool-worker-${name}-${workerName}":
        command         => "${symfonyRoot}/${symfonyConsole} ${starterCommand} ${workerOptions['arguments']}",
        autostart       => $autostart,
        autorestart     => true,
        user            => $symfonyUser,
        directory       => $symfonyRoot,
        startsecs       => 0,
        numprocs        => $workerOptions['count'],
        environment     => {
          'SYMFONY_ENV' => $symfonyEnvironment,
          'LANG'        => 'en_US.UTF-8',
        },
        notify          => Service['supervisord'],
      }
    }
  }

  file { "/etc/cron.d/workerpool-worker-rescheduler-${name}":
    ensure  => present,
    content => template('workerpool/cron/rescheduler.erb'),
    mode    => '644',
  }
}

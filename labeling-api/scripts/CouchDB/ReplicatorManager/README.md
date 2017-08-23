# Replication Manager

## About/Purpose

The Replication Manager is a service component, which is run as a deamon/worker
via `supervisord`. It is responsible for combining all incoming information
from the the single task databases into a read-only database store. This is
archived using couchdb replications via the `_replicator` database. The
read-only database is used for statistics and queries, which can not be executed
against the splitted databases efficiently.

Furthermore the `ReplicationManager` handles replicating changes of the
task databases over to the hot standby couch-1 server.

## Motivation

Unfortunately the couchdb is not able to mantain all of the replications needed
to archieve the desired effect as `continous`. Therefore the
`ReplicationManager` monitors the `_changes` feed and activates replications
only when needed.

## Technology

The `ReplicationManager` is a **nodejs** based script utilizing ES6 capability
as available in nodejs 8.x. `nvm` is used to manage the correct node version.
`yarn` is used as a dependency manager/installer.

## Prerequisites

In order to run the `ReplicationManager` the following dependencies need to be
installed:

- [nvm]()
- [yarn]()

After installing the necessary depedencies all needed JavaScript package
dependencies need to be installed:

```
nvm use
yarn
```

The above commands choose the right node version for the task and install all
needed dependencies. The commands need to be executed from within **this**
directory.

## Usage

The `ReplicationManager` is executed through the `supervisor-run.sh` script by
the `supervisord` system.

Manual execution from the commandline for debugging purposes is possible. See
the output of `node Application/Index.js` for details on the needed arguments.

## Development 

### Testing

The `ReplicationManager` has self contained unit tests. Those tests may be run
through `yarn`.

#### Run once
 
```
nvm use
yarn run test
```

#### Run and watch for changes

```
nvm use
yarn run test:continous
```

### Coding Style

The coding style used in this project is a slightly modified version of the
air-bnb javascript style. The ReplicationManager may be checked against the
coding style using `eslint`:

```
nvm use
yarn run eslint
```

### Debugging

Once running the `ReplicationManager` creates a debugging directory at
`/var/tmp/replication-manager-debug`. Certain debugging operation can be
triggered through this directory, by creating files with certain names under
the `control` subdirectory.

For example to dump all currently active tasks the following command can be
issued:

```
touch /var/tmp/replication-manager-debug/control/dumpActiveTasks
```

The active tasks will then be written into JSON files inside a timestamped
directory under `/var/tmp/replication-manager-debug/`. The command file will
be removed after processing automatically.

#### Commands

The following commands are available:

- `dumpActiveTasks`: Write all tasks currently in the active queue to disk
- `dumpWaitingTasks`: Write all queued, but not yet started tasks to disk

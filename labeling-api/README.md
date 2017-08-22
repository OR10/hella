# Labeling Tool Backend

This directory contains the Backend-Code for the HAGLA Labeling Tool.

## Architecture

### CouchDB

A `CouchDB` is used to store any User, Project, Groups, Label information.
After setting up the API (see _Installation Steps_), you can access the CouchDB Admin Interface at [http://192.168.222.20:5984/_utils/](http://192.168.222.20:5984/_utils/)

### PouchDB: Rebuild Permissions
```bash
/vagrant/app/AnnoStation/console annostation:rebuild-all-security-permissions
```

### RabbitMQ

A `RabbitMQ` is used for asynchronous job scheduling.
The jobs are scheduled by the application server and finished by workers.

### FrameCDN

The `FrameCDN` delivers single frame images of various types for the ui.

### Application server

The `Application server` provides an http api which is used by the ui as the backend.

### Worker

The `Worker` are daemon processes which are polling the queues of the `RabbitMQ` and process jobs.
The workerjobs are stopped default. After a fresh reboot you need to start your worker
`sudo supervisorctl start annostation-worker-pool:*`
you can also restart your worker with
`sudo supervisorctl restart annostation-worker-pool:*`

### Mailserver

Mailhog mailcatcher is running of the dev virtual machines. See http://192.168.222.20:8025/

## Development

During development a dev-server is required which runs the databases and webservers of the backend.

A single vagrant vm can be started by `vagrant up` which should bring up a vm
containing everything required for running the whole backend and even the
distribution build of the ui.

The vm uses the ip address: `192.168.222.20`.

### Single-VM

#### Installation steps
```bash
git clone https://github.crosscan.com/AnnoStation/AnnoStation
cd AnnoStation/labeling-api/
git submodule update --init --recursive
vagrant up
vagrant ssh
cd /vagrant
composer install
app/AnnoStation/console annostation:init
app/AnnoStation/console hagl:workerpool:setup
sudo supervisorctl start annostation-worker-pool:*
```

If you're having issues with the SSH key (`Permission denied (publickey).`):
```bash
ssh-add ~/.ssh/id_rsa
```

### Multi-VM

It is possible to spawn multiple vagrant boxes where each box represents one service.
Currently `mysql`, `couchdb` and `rabbitmq` are spawned in separate boxes and
everything else is uses a fourth box.

The current configuration uses the following ip addresses:

* `mysql`: `192.168.222.30`
* `couch`: `192.168.222.31`
* `workerqueue`: `192.168.222.32`
* `app`: `192.168.222.33`

In order to use the Multi-VM boxes, you can source the `vagrant-multi-env.sh`
file which sets environment variables for vagrant to avoid conflicts with the
default single-box setup.
After sourcing this file, you can use vagrant just like normal within the
terminal where you sourced the file.
*In all other terminals, the single vagrant box will be used.*

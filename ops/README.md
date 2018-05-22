# How to docker

## Init project

* Configure your virtual host (e.g. /etc/hosts)
```
    127.0.0.1 hella.loc
```

* Clone BE repository
 
* Init project

```bash
$ ops/scripts/install_locally.sh
```

## Start project

```bash
$ docker-compose up
```

### TROUBLESHUTTING

#### Selinux

```bash
$ chcon -Rt svirt_sandbox_file_t .
```

also stop firewalld for fedora or centOS

Who is listening a port
```bash
sudo netstat -nlp | grep 8080 
```

#### Composer symlinks  
```bash
unlink labeling-api/bin/phpcs
```

#### ELK

Error: `max virtual memory areas vm.max_map_count [65530] likely too low, increase to at least [262144]`

Fix:
```bash
sudo sysctl -w vm.max_map_count=262144
```
For Fedora you can permanently add line `vm.max_map_count=262144` to file `/etc/sysctl.d/99-sysctl.conf`
For Ubuntu - to file `/etc/sysctl.conf`


#### docker-machine
User is not a sudoer

Add line `dev ALL=(ALL) NOPASSWD: ALL` to the end of `/etc/sudoers` file.

## Backend

### how to run composer

Install vendors for api
```bash
$ docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance-composer composer install
```
Install vendors for video processing
```bash
$ docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance-composer composer install
```
### Init

Init project
```bash
$ docker-compose run --rm api-cron app/AnnoStation/console annostation:init -v
```

Init queue
```bash
$ docker-compose run --rm api-cron app/AnnoStation/console hagl:workerpool:setup -v
```

Run additional Consumers
```bash
$ docker-compose exec api-workerpool-high app/AnnoStation/console annostation:workerpool:starter high &
```

### DB

How to update CouchDB map/reduce
```bash
$ docker-compose run --rm api-cron app/AnnoStation/console doctrine:couchdb:update-design-doc -v
```

## New service implementation checklist

* Add service to docker-compose (Folder `service` or other. It depends on...) 
* Add build configuration to `ops/scripts/build_(fe|be).sh` and `install locally` file
* If you added new `docker-compose.yml` file - Add it to required `COMPOSE_FILE=` sections in `.env`, `build`, `deploy` 
and `install locally` files
* Add useful documentation into `README.md` and `confluence`

## Build and deploy

### Before deployment

Before deployment install [release-manager](https://github.com/itcreator/release-manager-micro) tool 

* Read the instructions from README.md
* Clone sources into folder on CI agent node
* Run service ops/scripts/start_semver.sh

### Build BE
```bash
$ DOCKER_HUB_USER={username} DOCKER_HUB_PASSWORD={pw} GIT_BRANCH={git tag or branch name} COMPANY_NAME={username or company from dockerhub} ops/scripts/build_be.sh
```

E.g. `DOCKER_FE_TAG`=`latest` `COMPANY_NAME`=`softeqhella`    


### Deployment via swarm and docker stack

Deployment configured with docker `swarm` [https://docs.docker.com/get-started/part4/]

Visualizer uses port 8888 

#### Before deployment you must prepare swarm cluster

Example:

Create docker machines
```bash
$ docker-machine create --swarm-experimental --driver virtualbox myvm1
$ docker-machine create --swarm-experimental --driver virtualbox myvm2
```

Create docker machines with `generic` driver for azure
```bash
$ docker-machine create --driver generic --generic-ssh-user=softeq-dev-hella --generic-ip-address=10.90.4.4 dev-proxy
$ docker-machine create --driver generic --generic-ssh-user=softeq-dev-hella --generic-ip-address=10.90.4.9 dev-api
$ docker-machine create --driver generic --generic-ssh-user=softeq-dev-hella --generic-ip-address=10.90.4.8 dev-video
``` 

Init swarm
```bash
$ docker-machine ssh myvm1 "docker swarm init --advertise-addr 192.168.99.101"
$ docker-machine ssh myvm2 "docker swarm join --token <token> <ip>:2377"
$ docker-machine ssh myvm1 "sudo sysctl -w vm.max_map_count=262144"
$ docker-machine ssh myvm2 "sudo sysctl -w vm.max_map_count=262144"
```

Label images
```bash
$ docker-machine ssh myvm1 "docker node update --label-add proxy=1 --label-add rmq=1 --label-add front=1 --label-add api_redis=1 --label-add api_db=1 --label-add api_cron=1 --label-add api_worker=1 --label-add api=1 myvm1"
$ docker-machine ssh myvm1 "docker node update --label-add video=1 --label-add elk=1 myvm2"
```

Configure machine with Elastic Search
```bash
$ docker-machine ssh myvm2 "sudo sysctl -w vm.max_map_count=262144"
```

#### How to deploy

*Note*: Currently we don't use swarm. Deployment by swarm can be broken. 

```bash
$ SWARM_USER=docker SWARM_MASTER={mastername} DOCKER_HUB_USER={hub_user} DOCKER_HUB_PASSWORD={pass} DOCKER_FE_TAG={tag} DOCKER_BE_TAG={tag} COMPANY_NAME=softeqhaglannostation ops/scripts/deploy_swarm.sh
```

#### Run once only after first deployment
```bash
$ docker exec -it $(docker ps -f name=cron -q) app/AnnoStation/console annostation:init -v
```

#### How to do something on swarm

First connect to docker node
```bash
$ docker-machine ssh myvm1
```

Show logs
```bash
docker logs $(docker ps -a -f name=api-cron -q)
```

Run some command 
```bash
docker exec -it $(docker ps -a -f name=api-fpm -q) bash
```


### Deployment via docker-compose

```bash
$ MACHINE_USER=softeq-dev API_MACHINE={machine-name} COUCHDB_MACHINE={machine-name} VIDEO_MACHINE={machine-name} MONITORING_MACHINE={machine-name} DOCKER_HUB_USER={hub_user} DOCKER_HUB_PASSWORD={pass} DOCKER_FE_TAG={tag} DOCKER_BE_TAG={tag} COMPANY_NAME=softeqhaglannostation ops/scripts/deploy_compose.sh
```

#### Run once only after first deployment
```bash
$ docker-compose run --rm api-cron app/AnnoStation/console annostation:init -v
```

## PHP Profiling

We do it by xhprof (fork tideways/php-xhprof-extension) and legacy GUI (phacility/xhprof see ops/docker/maintenance/xhprof)

Profiling logs is collecting from API service and from workers
 
### How to enable profiling in project 

You need to set environment variable `XHPROF_DIVIDER`. It define how frequently logs will be collected. 
Eg: `XHPROF_DIVIDER=1000 docker-compose up` will trigger collecting once per 1000 runs
By default `XHPROF_DIVIDER=0`. It means profiling is disabled.
 
 
### How to copy profiling logs

Copy form container:
```bash  
$ docker cp $(docker ps -f name=api-fpm -q):/tmp/ .xhprof
```

### How to view profiling info

Run docker container with gui: 
```bash  
$ run --rm -p 8101:80 -v $PWD/.xhprof/tmp:/tmp maintenance-xhprof  bash -c "php -S 0.0.0.0:80 /code/src/router.php"
```

Open Gui in browser [127.0.0.1:8101](http://127.0.0.1:8101/) 

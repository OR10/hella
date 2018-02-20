# How to docker

## Init project

* Configure your virtual host (e.g. /etc/hosts)
```
    127.0.0.1 hella.loc
```

* Clone BE repository
 
* Init project

```bash
$ ops/install_locally.sh
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

## Backend

### how to run composer

Install vendors for api
```bash
$ docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance_composer composer install
```
Install vendors for video processing
```bash
$ docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance_composer composer install
```

Init project
```bash
$ docker-compose run --rm api_cron app/AnnoStation/console annostation:init -v
```

Init queue
```bash
$ docker-compose run --rm api_cron app/AnnoStation/console hagl:workerpool:setup -v
```

Run additional Consumers
```bash
$ docker-compose exec api_workerpool_high app/AnnoStation/console annostation:workerpool:starter high &
```


## Front

### How to build front

Build yarn
```bash
$ docker-compose run --rm maintenance_node yarn
```

Build gulp
```bash
$ docker-compose run --rm maintenance_node gulp
```

Or just run bash in container if you need some else
```bash
$ docker-compose run --rm maintenance_node bash
```

## Build and deploy

### Build BE
```bash
$ DOCKER_HUB_USER={username} DOCKER_HUB_PASSWORD={pw} DOCKER_BE_TAG={git tag or branch name} COMPANY_NAME={username or company from dockerhub} ops/build_be.sh
```

E.g. `DOCKER_FE_TAG`=`latest` `COMPANY_NAME`=`softeqhella`    


### Build FE

```bash
$ DOCKER_HUB_USER={username} DOCKER_HUB_PASSWORD={pw} DOCKER_FE_TAG={git tag or branch name} COMPANY_NAME={username or company from dockerhub} ops/build_fe.sh
```

### Deployment

Deployment configured with docker `swarm` [https://docs.docker.com/get-started/part4/]

Visualizer uses port 8888 

#### Before deployment you must prepare swarm cluster

Example:

Create docker machines
```bash
$ docker-machine create --swarm-experimental --driver virtualbox myvm1
$ docker-machine create --swarm-experimental --driver virtualbox myvm2
``` 

Init swarm
```bash
$ docker-machine ssh myvm1 "docker swarm init --advertise-addr 192.168.99.101"
$ docker-machine ssh myvm2 "docker swarm join --token <token> <ip>:2377"
```

Label images
```bash
$ docker-machine ssh myvm1 "docker node update --label-add proxy=1 --label-add rmq=1 --label-add front=1 --label-add api_redis=1 --label-add api_db=1 --label-add api_cron=1 --label-add api_worker=1 --label-add api=1 myvm1"
$ docker-machine ssh myvm1 "docker node update --label-add video=1 myvm2"
```

#### How to deploy

```bash
$ SWARM_USER=docker SWARM_MASTER={mastername} DOCKER_HUB_USER={hub_user} DOCKER_HUB_PASSWORD={pass} DOCKER_FE_TAG={tag} DOCKER_BE_TAG={tag} COMPANY_NAME=softeqhaglannostation ops/deploy.sh
```

#### Run once only after first deployment


#### How to do something on swarm

First connect to docker node
```bash
$ docker-machine ssh myvm1
```

Show logs
```bash
docker logs $(docker ps -a -f name=api_cron -q)
```

Run some command 
```bash
docker exec -it $(docker ps -a -f name=api_fpm -q) bash
```

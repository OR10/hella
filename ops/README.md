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

### Selinux

```bash
$ chcon -Rt svirt_sandbox_file_t .
```

also stop firewalld for fedora or centOS

Who is listening a port
```bash
sudo netstat -nlp | grep 
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

### Build FE

```bash
$ DOCKER_HUB_USER={username} DOCKER_HUB_PASSWORD={pw} DOCKER_FE_TAG={git tag or branch name} COMPANY_NAME={username or company from dockerhub} ops/build_fe.sh
```

### Deployment

#!/usr/bin/env bash

set -ex

export REGISTRY_URL=docker.io
export APP_ENV=prod

################################################################
############# PARALLEL DEPLOYMENT BEGIN ##########################
################################################################

#################### MONITORING DEPLOYMENT BEGIN ####################
{
    #Make yml for docker monitoring
    export COMPOSE_FILE=ops/docker/compose/monitoring/elk.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/env/compose/prod-monitoring.yml
    docker-compose config > monitoring.yml

    #Copy docker-compose config
    docker-machine ssh $MONITORING_MACHINE "rm -f /home/$MACHINE_USER/monitoring.yml"
    docker-machine scp monitoring.yml $MONITORING_MACHINE:/home/$MACHINE_USER/
    docker-machine ssh $MONITORING_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f monitoring.yml pull --parallel && docker-compose -f monitoring.yml up -d"
}&
#################### MONITORING DEPLOYMENT END ####################


#################### COUCHDB DEPLOYMENT BEGIN ####################
{
    #Make yml for docker couchdb
    export COMPOSE_FILE=ops/docker/compose/service/api-couch.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/env/compose/prod-couchdb.yml
    docker-compose config > couchdb.yml

    #Copy docker-compose config
    docker-machine ssh $COUCHDB_MACHINE "rm -f /home/$MACHINE_USER/couchdb.yml"
    docker-machine scp couchdb.yml $COUCHDB_MACHINE:/home/$MACHINE_USER/
    docker-machine ssh $COUCHDB_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f couchdb.yml pull --parallel && docker-compose -f couchdb.yml up -d"
}&
#################### COUCHDB DEPLOYMENT END ####################


#################### API DEPLOYMENT BEGIN ####################
{
    #Make yml for docker api
    export COMPOSE_FILE=ops/docker/compose/service/api.yml:ops/docker/compose/service/doc.yml:ops/docker/compose/main.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/env/compose/prod-api.yml:ops/docker/compose/env/compose/prod-doc.yml:ops/docker/compose/env/prod_fe.yml
    docker-compose config > api.yml

    #Copy docker-compose config
    docker-machine ssh $API_MACHINE "rm -f /home/$MACHINE_USER/api.yml"
    docker-machine scp api.yml $API_MACHINE:/home/$MACHINE_USER/
    docker-machine ssh $API_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f api.yml pull --parallel && docker-compose -f api.yml up -d"
    docker-machine ssh $API_MACHINE "docker-compose -f api.yml run --rm api-cron bash -c \"app/AnnoStation/console cache:clear -vvv && app/AnnoStation/console cache:clear -vvv && app/AnnoStation/console doctrine:couchdb:update-design-doc -v\""
}&
#################### API DEPLOYMENT END ####################


#################### VIDEO DEPLOYMENT BEGIN ####################
{
    #Make yml for docker video
    export COMPOSE_FILE=ops/docker/compose/service/video.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/env/compose/prod-video.yml
    docker-compose config > video.yml

    #Copy docker-compose config
    docker-machine ssh $MONITORING_MACHINE "rm -f /home/$MACHINE_USER/video.yml"
    docker-machine scp video.yml $VIDEO_MACHINE:/home/$MACHINE_USER/
    docker-machine ssh $VIDEO_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f video.yml pull --parallel && docker-compose -f video.yml up -d"
}&
#################### VIDEO DEPLOYMENT END ####################

wait
################################################################
############# PARALLEL DEPLOYMENT END ##########################
################################################################

echo -e "\033[0;32mDone well\033[0m\n"

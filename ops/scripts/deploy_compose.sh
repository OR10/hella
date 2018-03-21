#!/usr/bin/env bash

set -ex

export REGISTRY_URL=docker.io
export APP_ENV=prod


#################### MONITORING DEPLOYMENT BEGIN ####################

#Make yml for docker monitoring
export COMPOSE_FILE=ops/docker/compose/env/compose/prod-monitoring.yml:ops/docker/compose/monitoring/elk.yml:ops/docker/compose/monitoring/logspout.yml
docker-compose config > monitoring.yml

#Copy docker-compose config
docker-machine scp monitoring.yml $MONITORING_MACHINE:/home/$MACHINE_USER/
docker-machine scp .env $MONITORING_MACHINE:/home/$MACHINE_USER/

docker-machine ssh $MONITORING_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f monitoring.yml pull && docker-compose -f monitoring.yml up -d"

docker-machine ssh $MONITORING_MACHINE "monitoring.yml"
docker-machine ssh $MONITORING_MACHINE ".env"

#################### MONITORING DEPLOYMENT END ####################


#################### COUCHDB DEPLOYMENT BEGIN ####################

#Make yml for docker couchdb
export COMPOSE_FILE=ops/docker/compose/service/api-couch.yml:ops/docker/compose/monitoring/logspout.yml
docker-compose config > couchdb.yml

#Copy docker-compose config
docker-machine scp couchdb.yml $COUCHDB_MACHINE:/home/$MACHINE_USER/
docker-machine scp .env $COUCHDB_MACHINE:/home/$MACHINE_USER/

docker-machine ssh $COUCHDB_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f couchdb.yml pull && docker-compose -f couchdb.yml up -d"

docker-machine ssh $COUCHDB_MACHINE "couchdb.yml"
docker-machine ssh $COUCHDB_MACHINE ".env"

#################### COUCHDB DEPLOYMENT END ####################


#################### API DEPLOYMENT BEGIN ####################

#Make yml for docker api
export COMPOSE_FILE=ops/docker/compose/env/compose/prod-api.yml:ops/docker/compose/env/prod_fe.yml:ops/docker/compose/main.yml:ops/docker/compose/service/api.yml:ops/docker/compose/service/front.yml:ops/docker/compose/monitoring/logspout.yml
docker-compose config > api.yml

#Copy docker-compose config
docker-machine scp api.yml $API_MACHINE:/home/$MACHINE_USER/
docker-machine scp .env $API_MACHINE:/home/$MACHINE_USER/

docker-machine ssh $API_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f api.yml pull && docker-compose -f api.yml up -d"

docker-machine ssh $API_MACHINE "api.yml"
docker-machine ssh $API_MACHINE ".env"

#################### API DEPLOYMENT END ####################


#################### MONITORING DEPLOYMENT BEGIN ####################

#Make yml for docker video
export COMPOSE_FILE=ops/docker/compose/env/compose/prod-video.yml:ops/docker/compose/service/video.yml:ops/docker/compose/monitoring/logspout.yml
docker-compose config > video.yml

#Copy docker-compose config
docker-machine scp video.yml $VIDEO_MACHINE:/home/$MACHINE_USER/
docker-machine scp .env $VIDEO_MACHINE:/home/$MACHINE_USER/

docker-machine ssh $VIDEO_MACHINE "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker-compose -f video.yml pull && docker-compose -f video.yml up -d"

docker-machine ssh $VIDEO_MACHINE "video.yml"
docker-machine ssh $VIDEO_MACHINE ".env"

#################### MONITORING DEPLOYMENT END ####################

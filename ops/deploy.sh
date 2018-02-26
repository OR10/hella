#!/usr/bin/env bash

set -ex

export REGISTRY_URL=docker.io
export APP_ENV=prod

#Make yml for docker stack
export COMPOSE_FILE=ops/docker/compose/env/prod_be.yml:ops/docker/compose/env/prod_fe.yml:ops/docker/compose/main.yml:ops/docker/compose/service/api.yml:ops/docker/compose/service/video.yml:ops/docker/compose/service/front.yml
docker-compose config > tmp.yml

#Copy environment
docker-machine scp .env $SWARM_MASTER:/home/$SWARM_USER/
#Copy docker stack config
docker-machine scp tmp.yml $SWARM_MASTER:/home/$SWARM_USER/

#Deployment
docker-machine ssh $SWARM_MASTER "docker stack rm hella"
docker-machine ssh $SWARM_MASTER "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker stack deploy -c tmp.yml hella --with-registry-auth"


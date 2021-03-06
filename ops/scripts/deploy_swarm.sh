#!/usr/bin/env bash

set -ex

export REGISTRY_URL=docker.io
export APP_ENV=prod

#Make yml for docker stack
export COMPOSE_FILE=ops/docker/compose/swarm.yml:ops/docker/compose/env/prod_be.yml:ops/docker/compose/env/prod_fe.yml:ops/docker/compose/main.yml:ops/docker/compose/service/api.yml:ops/docker/compose/service/doc.yml:ops/docker/compose/service/api-couch.yml:ops/docker/compose/service/video.yml:ops/docker/compose/monitoring/elk.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/monitoring/visualizer.yml
docker-compose config > tmp.yml

#Copy docker stack config
docker-machine ssh $SWARM_MASTER "rm -f /home/$SWARM_USER/tmp.yml"
docker-machine scp tmp.yml $SWARM_MASTER:/home/$SWARM_USER/

#Deployment
#docker-machine ssh $SWARM_MASTER "docker stack rm hella"
#sleep 25
docker-machine ssh $SWARM_MASTER "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker stack deploy -c tmp.yml hella --with-registry-auth"
#docker-machine ssh $SWARM_MASTER "docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD && docker stack deploy -c tmp.yml hella --with-registry-auth && sleep 60 && docker stack deploy -c tmp.yml hella --with-registry-auth"

docker-machine ssh $SWARM_MASTER "rm tmp.yml"

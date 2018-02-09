#!/usr/bin/env bash

source .env
set -ex

export COMPOSE_FILE=ops/docker/compose/env/prod_fe.yml:ops/docker/compose/maintenance/fe.yml:ops/docker/compose/service/front.yml
export APP_ENV=prod
export REGISTRY_URL=docker.io

docker-compose stop
docker-compose build maintenance_node

#TODO: run tests

#TODO: !!!!fix warn GitHub rate limit reached.                  !!!!
#TODO: !!!!Would you like to set up your GitHub credentials?    !!!!

#Build yarn
docker-compose run --rm maintenance_node yarn

#Build gulp
docker-compose run --rm maintenance_node gulp

#Create symlinc for nginx
cd labeling-ui && ln -sf Distribution labeling && cd ..
docker-compose stop
docker-compose build front


docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD
docker-compose push

echo -e "\033[0;32mDone well\033[0m\n"

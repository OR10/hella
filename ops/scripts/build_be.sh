#!/usr/bin/env bash

source .env
set -ex

export COMPOSE_FILE=ops/docker/compose/env/prod_be.yml:ops/docker/compose/maintenance/be.yml:ops/docker/compose/main-build.yml:ops/docker/compose/main.yml:ops/docker/compose/service/api-build.yml:ops/docker/compose/service/api.yml:ops/docker/compose/service/api-couch.yml:ops/docker/compose/service/video-build.yml:ops/docker/compose/service/video.yml:ops/docker/compose/monitoring/elk-build.yml:ops/docker/compose/monitoring/elk.yml:ops/docker/compose/monitoring/logspout.yml:ops/docker/compose/monitoring/visualizer.yml
export APP_ENV=prod
export REGISTRY_URL=docker.io

#TODO: run tests in separated script
#TODO: and fix dependencies and validate composer file for API and for video processing
#docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance-composer composer  validate --no-check-all --strict
#docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance-composer composer  validate --no-check-all --strict

#install composer dependencies
docker-compose stop
docker-compose build maintenance-composer


docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance-composer composer install -v --profile --no-dev -o
docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance-composer composer install -v --profile --no-dev -o

#Build images
docker-compose stop
docker-compose build proxy api-nginx api-fpm api-workerpool-low api-cron video-nginx video-fpm monitoring-logstash

#Push images
docker login --username=$DOCKER_HUB_USER --password=$DOCKER_HUB_PASSWORD

images=$(docker-compose config | sort -u | grep -o 'image:.*' | grep $REGISTRY_URL | cut -d" " -f2)
for image in $images; do
    echo "Pushing image: $image"
    docker push $image
done

echo -e "\033[0;32mDone well\033[0m\n"
#!/usr/bin/env bash

set -ex

docker-compose stop

#If labeling_ui exist it means containers are built and UI is cloned
if [ ! -d labeling-ui ]; then
    #Init frontend folder
    git clone ssh://git@stash.softeq.com:7999/hellaas/hagl_annostation_ui.git labeling-ui

    #build docker containers
#    docker-compose build
fi

##### BACKEND

#Install vendors for api
docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance_composer composer install -v

#Install vendors for video processing
docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance_composer composer install -v

#TODO: remove sleep. use healthcheck
#Init project
docker-compose run --rm api_cron bash -c "sleep 7 && app/AnnoStation/console annostation:init -v"

#Init queue
docker-compose run --rm api_cron bash -c "sleep 7 &&  app/AnnoStation/console hagl:workerpool:setup -v"


##### FRONTEND

#Build yarn
docker-compose run --rm maintenance_node yarn

#Build gulp
docker-compose run --rm maintenance_node gulp

#Create symlinc for nginx
cd labeling-ui && ln -sf Distribution labeling && cd ..

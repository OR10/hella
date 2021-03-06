#!/usr/bin/env bash

set -ex

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
echo $SCRIPTPATH
cd $SCRIPTPATH"/../.."

echo $SCRIPTPATH"/../../labeling-ui"

docker-compose stop

#If labeling_ui exist it means containers are built and UI is cloned
if [ ! -d labeling-ui ]; then
    #Init frontend folder
    git clone ssh://git@stash.softeq.com:7999/hellaas/hagl_annostation_ui.git labeling-ui
fi

##### BACKEND

#Install vendors for api
docker-compose run --rm -v $PWD/labeling-api/:/code:Z maintenance-composer composer install -vvv --profile

#Install vendors for video processing
docker-compose run --rm -v $PWD/labeling-video-processing/:/code:Z maintenance-composer composer install -vvv --profile

#TODO: remove sleep. use healthcheck
#Init project
docker-compose run --rm api-cron bash -c "sleep 7 && app/AnnoStation/console annostation:init -v"

#Init queue
docker-compose run --rm api-cron bash -c "sleep 7 &&  app/AnnoStation/console hagl:workerpool:setup -v"


##### FRONTEND

cd $SCRIPTPATH"/../../labeling-ui"

#Build yarn
docker-compose run --user $(id -u) --rm maintenance-node yarn

#Build gulp
docker-compose run --user $(id -u) --rm maintenance-node gulp

#Create symlinc for nginx
ln -sf Distribution labeling
cd $SCRIPTPATH"/../.."

docker-compose stop

#build docker containers
docker-compose build

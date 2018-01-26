#!/usr/bin/env bash
set -e

rm -rf /run/shm/labeling_api/cache/*
rm -rf /var/cache/labeling_api/*
cd /var/www/hella/labeling-api/ && composer install


cd ../labeling-ui
yarn
gulp

cd .. && tar --exclude='./ansible' --exclude='./electron' --exclude='./labeling-docs' --exclude='./ops' --exclude='./puppet' --exclude='./terraform'  --exclude='./users' --exclude='.idea' --exclude='.g*' --exclude='./tmp' --exclude='./labeling-ui/node_modules' --exclude='./labeling-ui/Tests'  --exclude='./labeling-ui/.idea' --exclude='./labeling-ui/Application' --exclude='./labeling-ui/Documentation' --exclude='./labeling-ui/Crosscan' --exclude='*.scss'  -zcvf ./ops/build.tgz .

echo -e "\033[0;32mDone well\033[0m\n"

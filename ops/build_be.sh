#!/usr/bin/env bash
set -ex

#TODO: fix dependencies and uncomment composer validate line
#composer  validate --no-check-all --strict
composer install

cd /var/www/hella/labeling-video-processing/
composer  validate --no-check-all --strict
composer install


echo -e "\033[0;32mDone well\033[0m\n"

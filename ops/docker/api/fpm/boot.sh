#!/usr/bin/env bash

app/AnnoStation/console cache:clear

#tail -f /dev/null
php-fpm --allow-to-run-as-root

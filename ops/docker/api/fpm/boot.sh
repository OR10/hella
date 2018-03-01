#!/usr/bin/env bash

# Disable xdebug in production environment
xdebug_config=/usr/local/etc/php/conf.d/xdebug.ini
#if [ -f $xdebug_config ] && [ "$SYMFONY_ENV" == "prod" ]; then
#    rm $xdebug_config
#fi

#./bin/healthcheck 10

# Prepare application
#bin/console cache:clear
# !!!! while we are not in PROD - use schema update
#bin/console doctrine:schema:update --force -n
#bin/console doctr:migration:migrate -n

#tail -f /dev/null
php-fpm --allow-to-run-as-root

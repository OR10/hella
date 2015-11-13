#!/bin/sh

NAME="${1}"

if [ "${NAME}" = "vagrant" -o "${NAME}" = "app.vagrant" ]; then
    sudo -u vagrant /vagrant/app/console doctrine:schema:update --force
    sudo -u vagrant /vagrant/app/console doctrine:couchdb:update-design-doc

    echo " "
    echo "************************************************************"
    echo " "
    echo "Please consider to run"
    echo " "
    echo "    app/console annostation:init"
    echo " "
    echo "to initialize your database with a clean state."
    echo " "
    echo "************************************************************"
    echo " "
fi

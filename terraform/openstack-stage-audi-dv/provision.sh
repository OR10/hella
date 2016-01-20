#!/bin/sh

sudo mkdir -p /var/www/audi-dv-api
sudo chown ubuntu /var/www/audi-dv-api

sudo apt-get update

sudo \
    FACTER_annostation_project=audi-dv \
    /opt/puppetlabs/bin/puppet apply \
    --modulepath puppet/modules:puppet/vendor:/etc/puppet/modules \
    --hiera_config=puppet/hiera/hiera.yaml \
    --environmentpath puppet/environments/ \
    --environment staging \
    --verbose --debug \
    puppet/environments/staging/manifests/site.pp


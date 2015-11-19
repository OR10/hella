#!/bin/sh

sudo mkdir -p /var/www/labeling-api
sudo chown ubuntu /var/www/labeling-api

cd /home/ubuntu

sudo /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment staging \
    /home/ubuntu/puppet/environments/staging/manifests/site.pp



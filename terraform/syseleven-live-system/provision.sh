#!/bin/sh

sudo apt-get update

if [ ! -e "puppetlabs-release-pc1-trusty.deb" ]; then
    wget https://apt.puppetlabs.com/puppetlabs-release-pc1-trusty.deb
    sudo dpkg -i puppetlabs-release-pc1-trusty.deb
    sudo apt-get update
fi

sudo apt-get -y install aptitude
sudo aptitude -y upgrade
sudo aptitude -y install git
sudo aptitude -y install puppet-agent

sudo mkdir -p /var/www/labeling-api
sudo chown ubuntu /var/www/labeling-api

cd /home/ubuntu

sudo \
    FACTER_annostation_project=labeling \
    /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment syseleven_live \
    --debug \
    --verbose \
    /home/ubuntu/puppet/environments/syseleven_live/manifests/site.pp

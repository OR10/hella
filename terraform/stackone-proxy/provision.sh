#!/bin/sh

sudo apt-get update
wget https://apt.puppetlabs.com/puppetlabs-release-pc1-trusty.deb
sudo dpkg -i puppetlabs-release-pc1-trusty.deb
sudo apt-get update
sudo aptitude -y upgrade
sudo aptitude -y install git
sudo aptitude -y install puppet-agent

cd /home/ubuntu

sudo \
    /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment proxy \
    --verbose \
    /home/ubuntu/puppet/environments/proxy/manifests/site.pp

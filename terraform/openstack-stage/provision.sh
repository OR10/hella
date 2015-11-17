#!/bin/sh
sudo apt-get update
wget https://apt.puppetlabs.com/puppetlabs-release-pc1-trusty.deb
sudo dpkg -i puppetlabs-release-pc1-trusty.deb
sudo apt-get update
sudo aptitude -y install git
sudo aptitude -y install puppet-agent

#sudo "/bin/echo '192.168.123.63 github.crosscan.com' >> /etc/hosts"
#git clone git@github.crosscan.com:AnnoStation/AnnoStation.git

sudo mkdir -p /var/www/labeling-api
sudo chown ubuntu /var/www/labeling-api

sudo /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment staging \
    /home/ubuntu/puppet/environments/staging/manifests/site.pp



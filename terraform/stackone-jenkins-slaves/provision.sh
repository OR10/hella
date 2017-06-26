#!/bin/sh

cd /home/ubuntu

sudo apt-get update
wget https://apt.puppetlabs.com/puppetlabs-release-pc1-trusty.deb
sudo dpkg -i puppetlabs-release-pc1-trusty.deb
sudo apt-get update
sudo apt-get -y upgrade
sleep 3
sudo aptitude -y install puppet-agent git openjdk-7-jre icedtea-7-plugin python-jenkins

wget https://repo.jenkins-ci.org/releases/org/jenkins-ci/plugins/swarm-client/2.0/swarm-client-2.0-jar-with-dependencies.jar

sudo \
    /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml  \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment staging \
    /home/ubuntu/puppet/environments/staging/manifests/site.pp

sudo gem2.0 install capistrano capistrano-scm-copy

echo '@reboot sleep 30 && /usr/local/bin/jenkinsSwarmSlaveScreen.sh' | crontab -u ubuntu -

sleep 3

sudo reboot

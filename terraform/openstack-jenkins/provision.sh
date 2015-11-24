#!/bin/sh
sudo apt-get update
wget https://apt.puppetlabs.com/puppetlabs-release-pc1-trusty.deb
sudo dpkg -i puppetlabs-release-pc1-trusty.deb
sudo apt-get update
sudo apt-get -y upgrade
sleep 3
sudo aptitude -y install puppet-agent git openjdk-7-jre icedtea-7-plugin

wget http://maven.jenkins-ci.org/content/repositories/releases/org/jenkins-ci/plugins/swarm-client/2.0/swarm-client-2.0-jar-with-dependencies.jar

sudo /opt/puppetlabs/bin/puppet apply \
    --modulepath /home/ubuntu/puppet/modules:/home/ubuntu/puppet/vendor:/etc/puppet/modules \
    --hiera_config=/home/ubuntu/puppet/hiera/hiera.yaml  \
    --environmentpath /home/ubuntu/puppet/environments/ \
    --environment staging \
    /home/ubuntu/puppet/environments/staging/manifests/site.pp

sudo gem2.0 install capistrano capistrano-scm-copy

echo '#!/bin/bash' > jenkinsSwarmSlaveScreen.sh
echo '/usr/bin/screen -dmS jenkins /usr/bin/java -Xmx1024m -XX:MaxPermSize=256M -XX:+CMSClassUnloadingEnabled -XX:+CMSPermGenSweepingEnabled -jar swarm-client-2.0-jar-with-dependencies.jar -username cho -password ef5a2b4ec677cbabd94ef3fc753922f2 -name `hostname` -labels "AnnoStation swarm PHP56 MySQL NodeJS CouchDB `hostname`" -master https://jenkins.crosscan.com/' >> jenkinsSwarmSlaveScreen.sh

chmod +x jenkinsSwarmSlaveScreen.sh
sudo mv jenkinsSwarmSlaveScreen.sh /usr/local/bin/jenkinsSwarmSlaveScreen.sh

echo '@reboot sleep 30 && /usr/local/bin/jenkinsSwarmSlaveScreen.sh' | crontab -u ubuntu -


sleep 3
sudo reboot

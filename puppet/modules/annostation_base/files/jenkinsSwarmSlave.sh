#!/bin/bash

echo "Sleeping for 30 seconds."

sleep 30

sudo service mysql stop || true
sudo augtool set '/files/etc/mysql/my.cnf/target[ . = "mysqld"]/datadir' /dev/shm/mysql
sudo cp -a /var/lib/mysql /dev/shm/mysql
sudo service mysql start

# remove possibly existing node with same hostname first
/usr/bin/python <<EoP
import jenkins
import platform

nodename = platform.node()

master = jenkins.Jenkins('https://jenkins.crosscan.com', 'cho', 'ef5a2b4ec677cbabd94ef3fc753922f2');

if master.node_exists(nodename):
        master.delete_node(nodename)
EoP

# run swarm plugin in screen session
/usr/bin/screen -dmS jenkins \
    /usr/bin/java \
    -Xmx1024m \
    -XX:MaxPermSize=256M \
    -XX:+CMSClassUnloadingEnabled \
    -XX:+CMSPermGenSweepingEnabled \
    -jar swarm-client-2.0-jar-with-dependencies.jar \
    -username cho \
    -password ef5a2b4ec677cbabd94ef3fc753922f2 \
    -name `hostname` \
    -labels "AnnoStation swarm PHP7 MySQL NodeJS CouchDB ElasticSearch `hostname`" \
    -master https://jenkins.crosscan.com \
    -disableClientsUniqueId

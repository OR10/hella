#!/bin/sh
sudo cp -a /etc/couchdb/local.d/ /tmp/couchdb-local.d-test
sudo docker run -l test_couchdb -v /tmp/couchdb-local.d-test/crosscan-admins.ini:/usr/local/etc/couchdb/local.d/crosscan-admins.ini -v /tmp/couchdb-local.d-test/crosscan.ini:/usr/local/etc/couchdb/local.d/crosscan.ini -p 5989:5984 -d couchdb
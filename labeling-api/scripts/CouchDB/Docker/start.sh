#!/bin/sh
sudo rm -rf /tmp/couchdb-local.d-test
sudo cp -a /etc/couchdb/local.d/ /tmp/couchdb-local.d-test
sudo docker run -l test_couchdb -v /tmp/couchdb-local.d-test:/usr/local/etc/couchdb/local.d -p 5989:5984 -d couchdb

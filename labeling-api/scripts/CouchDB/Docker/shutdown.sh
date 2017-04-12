#!/bin/sh
sudo docker ps -a -q -f label=test_couchdb | xargs -r sudo docker rm -f
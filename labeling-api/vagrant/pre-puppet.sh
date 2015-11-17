#!/bin/sh

if [ ! -e /var/cache/initial.apt-get.update ]; then
    apt-get update
    apt-get install --yes --no-install-recommends software-properties-common
    touch /var/cache/initial.apt-get.update
fi

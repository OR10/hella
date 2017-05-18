#!/bin/sh

if [ ! -e /var/cache/initial.apt-get.update ]; then
    # import new puppetlabs key
    gpg --keyserver pgp.mit.edu --recv-key 7F438280EF8D349F
    gpg -a --export EF8D349F | apt-key add -

    apt-get update
    apt-get install --yes --no-install-recommends software-properties-common
    touch /var/cache/initial.apt-get.update
fi

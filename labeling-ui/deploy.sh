#!/bin/sh
# This script is currently being used to deploy the software to a new staging-system.
npm install
jspm config registries.github.auth bWFudGl6OmMxYWI4NWM5OWEyMDAzNWUyZmFjMGJlYTkzY2QzZThjODA4ZTVlMGQ=
jspm install
gulp test-unit
gulp test-e2e
gulp
rsync -e 'ssh -o UserKnownHostsFile=/dev/null,StrictHostKeyChecking=no' -a Distribution/ root@${1}:/var/www/labeling-ui/

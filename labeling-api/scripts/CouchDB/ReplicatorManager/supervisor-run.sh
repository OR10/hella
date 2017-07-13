#!/bin/bash
HOME=$(eval "echo ~${USER}")

source "${HOME}/.nvm/nvm.sh"

if ! nvm which; then
    nvm install
fi

nvm use

if [ ! -d "./node_modules" ]; then
    yarn
fi

node ./Application/Index.js "$@"

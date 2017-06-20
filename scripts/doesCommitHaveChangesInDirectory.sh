#!/bin/sh

set -eu

COMMIT=$1
DIRECTORY=$2

git diff "origin/master...${COMMIT}" --name-only | grep -q "^${DIRECTORY}.*$"


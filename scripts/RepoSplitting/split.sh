#!/bin/bash

set -e
set -o pipefail

SOURCE_REPO="${1}"
TARGET_REPO="${2}"
INCLUDES="${3}"
EXCLUDES="${4}"
HISTORY_EXCLUDES="${5}"

log() {
  local message="${@}"
  echo "✳️  ${message}"
}

error() {
  local message="${@}"
  echo "⛔️  ${message}" >&2
}

showUsageIfNecessary() {
  if [ "$#" -lt 5 ]; then
    echo "${0} <source-repository> <target-directory> <includes-file> <excludes-file> <history-excludes-file>"
    exit 1
  fi
}

prepare() {
  local source="${1}"
  local target="${2}"

  if [ -d "${target}" ]; then
    echo -n "🤷‍♀️  Directory ${target} does already exist. Delete? (y/N) "
    read deleteFlag
    if [ "${deleteFlag}" != "y" ]; then
      exit 2
    fi

    rm -rf "${target}"
  fi

  if [ -e "${target}" ]; then
    error "The ${target} exists, but is not a directory!"
    exit 3
  fi

  log "Isolating master branch of ${source}"
  git clone -b master --single-branch "${source}" "${target}"

  pushd "${target}" >/dev/null
  git remote remove origin
  popd >/dev/null
}

saveHistoryExcludes() {
  local repository="${1}"
  local historyExcludes="${2}"
  local historyStorage="${3}"

  pushd "${repository}" >/dev/null
  log "Storing history excludes for later reintroduction from ${historyExcludes}"
  git checkout master

  tar cvf "${historyStorage}" -T "${historyExcludes}"
  popd >/dev/null
}

restoreHistoryExcludes() {
  local repository="${1}"
  local historyStorage="${2}"

  pushd "${repository}" >/dev/null
  log "Restoring history excludes from ${historyStorage}"
  git checkout master

  tar xvf "${historyStorage}"
  rm "${historyStorage}"
  popd >/dev/null
}

commitHistoryStorage() {
  local repository="${1}"

  pushd "${repository}" >/dev/null
  log "Commiting history storage on top of ${repository}"
  git checkout master

  git ls-files --others -z|xargs -0 -n 32 -- git add
  git ci -m "Restored files without history after repository split"

  popd >/dev/null
}



filterRepository() {
  local repository="${1}"
  local includes="${2}"
  local excludes="${3}"
  local historyExcludes="${4}"


  pushd "${repository}" >/dev/null
  log "Removing everything but the includes from ${includes}"
  git checkout master
  git filter-branch --prune-empty --tree-filter "\
    git ls-files|rg -f \"${includes}\" -v|xargs -d '\n' -n 32 -- rm -rf;\
    git ls-files|rg -f \"${excludes}\"|xargs -d '\n' -n 32 -- rm -rf;\
    git ls-files|rg -f \"${historyExcludes}\"|xargs -d '\n' -n 32 -- rm -rf;"

  popd >/dev/null
}

main() {
  local historyStorage="$(mktemp)"

  prepare "${SOURCE_REPO}" "${TARGET_REPO}"
  saveHistoryExcludes "${TARGET_REPO}" "${HISTORY_EXCLUDES}" "${historyStorage}"
  filterRepository "${TARGET_REPO}" "${INCLUDES}" "${EXCLUDES}" "${HISTORY_EXCLUDES}"
  restoreHistoryExcludes "${TARGET_REPO}" "${historyStorage}"
  commitHistoryStorage "${TARGET_REPO}"
  log "Everything done! Have a 🍻!"
}

showUsageIfNecessary "$@"
main

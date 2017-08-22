#!/bin/bash

set -e
set -o pipefail

SOURCE_REPO="${1}"
TARGET_REPO="${2}"
INCLUDES="${3}"
EXCLUDES="${4}"
HISTORY_EXCLUDES="${5}"
COMMIT_MESSAGE_FILTERS="${6}"
BRANCH="${7}"

log() {
  local message="${@}"
  echo "✳️  ${message}"
}

error() {
  local message="${@}"
  echo "⛔️  ${message}" >&2
}

showUsageIfNecessary() {
  if [ "$#" -lt 6 ]; then
    echo "${0} <source-repository> <target-directory> <includes-file> <excludes-file> <history-excludes-file> <commit-message-blacklist>"
    exit 1
  fi
}

relativeToAbsolute() {
  local relative="${1}"
  (
    if [ "${relative%/*}" != "${relative}" ]; then
      cd ${relative%/*}
    fi

    echo $PWD/${relative##*/}
  )
}

prepare() {
  local source="${1}"
  local target="${2}"
  local branch="${3}"

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

  log "Isolating ${branch} branch of ${source}"
  git clone -b "${branch}" --single-branch "${source}" "${target}"

  pushd "${target}" >/dev/null
  git remote remove origin
  popd >/dev/null
}

saveHistoryExcludes() {
  local repository="${1}"
  local historyExcludes="${2}"
  local historyStorage="${3}"
  local branch="${4}"

  pushd "${repository}" >/dev/null
  log "Storing history excludes for later reintroduction from ${historyExcludes}"
  git checkout "${branch}"

  tar cvf "${historyStorage}" -T "${historyExcludes}"
  popd >/dev/null
}

restoreHistoryExcludes() {
  local repository="${1}"
  local historyStorage="${2}"
  local branch="${3}"

  pushd "${repository}" >/dev/null
  log "Restoring history excludes from ${historyStorage}"
  git checkout "${branch}"

  tar xvf "${historyStorage}"
  rm "${historyStorage}"
  popd >/dev/null
}

commitHistoryStorage() {
  local repository="${1}"
  local branch="${2}"

  pushd "${repository}" >/dev/null
  log "Commiting history storage on top of ${repository}"
  git checkout "${branch}"

  git ls-files --others -z|xargs -0 -n 32 -- git add
  git commit -m "Restored files without history after repository split"

  popd >/dev/null
}

filterRepository() {
  local repository="${1}"
  local includes="${2}"
  local excludes="${3}"
  local historyExcludes="${4}"
  local branch="${5}"

  local preprocessedIncludes="$(prepareFileListForRgFiltering "${includes}")"
  local preprocessedExcludes="$(prepareFileListForRgFiltering "${excludes}")"
  local preprocessedHistoryExcludes="$(prepareFileListForRgFiltering "${historyExcludes}")"

  pushd "${repository}" >/dev/null
  log "Removing everything, which should not longer be there according to excludes, includes and history-excludes."
  log "This will take a long (hours) time. Grab a coffee and something to eat ;)"
  git checkout "${branch}"
  git filter-branch --prune-empty --tree-filter "\
    git ls-files|rg -f \"${preprocessedIncludes}\" -v|xargs -d '\n' -n 32 -- rm -rf;\
    git ls-files|rg -f \"${preprocessedExcludes}\"|xargs -d '\n' -n 32 -- rm -rf;\
    git ls-files|rg -f \"${preprocessedHistoryExcludes}\"|xargs -d '\n' -n 32 -- rm -rf;"

  popd >/dev/null

  # Cleanup temp files
  rm "${preprocessedIncludes}"
  rm "${preprocessedExcludes}"
  rm "${preprocessedHistoryExcludes}"
}

filterCommitMessages() {
  local repository="${1}"
  local commitMessageFilters="${2}"
  local branch="${3}"

  pushd "${repository}" >/dev/null
  log "Filtering commit messages to not include blacklist words"
  git checkout "${branch}"
  git filter-branch --msg-filter "\
    gawk 'FNR==NR{
     blacklist[\$0]
     next
    }
    {
    for(i=1;i<=NF;i++){
      for(candidate in blacklist) {
        if (tolower(\$i) ~ \"[^a-zA-Z0-9_-]*\" candidate \"[^a-zA-Z0-9_-]*\"){
          replacement=gensub(\"([^a-zA-Z0-9_-]*)\" candidate \"([^a-zA-Z0-9_-]*)\", \"\\\\1****\\\\2\", \"g\", tolower(\$i))
          \$i=replacement
          break
        }
      }
    }
  }1' \"${commitMessageFilters}\" -"

  popd >/dev/null
}

removeBackupRefs() {
  local repository="${1}"
  pushd "${repository}" >/dev/null
  log "Removing backup refs (refs/original)"
  git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

  popd >/dev/null
}

prepareFileListForRgFiltering() {
  local inputList="${1}"

  local outputList="$(mktemp)"

  # Prepend a ^ character to every line
  cat "${inputList}"|sed -e 's@^@^@' >"${outputList}"

  echo "${outputList}"
}

main() {
  local historyStorage="$(mktemp)"
  local absoluteSourceRepo="$(relativeToAbsolute "${SOURCE_REPO}")"
  local absoluteTargetRepo="$(relativeToAbsolute "${TARGET_REPO}")"
  local absoluteHistoryExcludes="$(relativeToAbsolute "${HISTORY_EXCLUDES}")"
  local absoluteIncludes="$(relativeToAbsolute "${INCLUDES}")"
  local absoluteExcludes="$(relativeToAbsolute "${EXCLUDES}")"
  local absoluteCommitMessageFilters="$(relativeToAbsolute "${COMMIT_MESSAGE_FILTERS}")"
  local branch="${BRANCH}"


  prepare "${absoluteSourceRepo}" "${absoluteTargetRepo}" "${branch}"
  saveHistoryExcludes "${absoluteTargetRepo}" "${absoluteHistoryExcludes}" "${historyStorage}" "${branch}"
  filterRepository "${absoluteTargetRepo}" "${absoluteIncludes}" "${absoluteExcludes}" "${absoluteHistoryExcludes}" "${branch}"
  removeBackupRefs "${absoluteTargetRepo}"
  filterCommitMessages "${absoluteTargetRepo}" "${absoluteCommitMessageFilters}" "${branch}"
  removeBackupRefs "${absoluteTargetRepo}"
  restoreHistoryExcludes "${absoluteTargetRepo}" "${historyStorage}" "${branch}"
  commitHistoryStorage "${absoluteTargetRepo}" "${branch}"
  log "Everything done! Have a 🍻!"
}

showUsageIfNecessary "$@"
main

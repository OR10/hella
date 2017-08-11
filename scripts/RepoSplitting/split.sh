#!/bin/bash
SOURCE_REPO=$1
TARGET_REPO=$2
DIRECTORIES=$3
EXCLUDES=$4
CLEAN_COMMIT_HISTORY_FILES=$5

function copyDirectory {
    SOURCE_REPO=$1
    TARGET_REPO=$2
    DIR=$3

    echo "[${DIR}] Creating temporary directory branch"
    cd $SOURCE_REPO
    git subtree split -P $DIR -b tmp_${DIR}

    echo "[${DIR}] Applying temporary branch into the new one"
    cd ${TARGET_REPO}
    git subtree add -P $DIR $SOURCE_REPO tmp_$DIR

    echo "[${DIR}] Cleanup temporary branch"
    cd $SOURCE_REPO
    git branch -D tmp_$DIR
}


##
## Create a new Repository
##

rm -rf ${TARGET_REPO}
mkdir ${TARGET_REPO}
cd ${TARGET_REPO}
git init
touch .gitignore
git add .gitignore
git commit -m "Ignore file added." .gitignore


##
## Copy Directories to the new Repo
##

while read i
do
    copyDirectory $SOURCE_REPO $TARGET_REPO $i
done < $DIRECTORIES




exit;



##
## Exclude Files from new Branch
##
cd ${TARGET_REPO}
while read exclude
do
    git filter-branch -f --prune-empty --index-filter 'git rm --cached --ignore-unmatch $(git ls-files | grep '"\"$exclude\""')'

    # git filter-branch -f --prune-empty --index-filter 'git rm --cached --ignore-unmatch $(git ls-files -i --exclude-from='"\"$EXCLUDES\""')'

done < $EXCLUDES









##
## Clean commit history
##
cd $SOURCE_REPO
git branch tmp_cleanup_commit_history $(echo "First commit after commit messages cleanup" | git commit-tree HEAD^{tree})
git filter-branch -f --prune-empty --index-filter 'git rm --cached --ignore-unmatch $(git ls-files | grep '"\"$CLEAN_COMMIT_HISTORY_FILES\""')'

echo "[${DIR}] Applying temporary branch into the new one"
cd ${TARGET_REPO}
git subtree add -P $DIR $SOURCE_REPO tmp_$DIR
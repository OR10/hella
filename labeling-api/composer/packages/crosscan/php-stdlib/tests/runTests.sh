# Simulation of the readlink -f call, which is not accesible under macosx
function readlinkf() {
    local infile="${1}"
    local current="${1}"
    local readdir=""

    cd "$(dirname "$current")"
    current="$(basename "$current")"

    while [ -L "${current}" ]
    do
        current="$(readlink "$current")"
        cd "$(dirname "$current")"
        current="$(basename "$current")"
    done

    realdir="$(pwd -P)"
    echo "${realdir}/${current}"
}

TEST_DIRECTORY="$(dirname "$(readlinkf "$0")")"

/usr/bin/env php \
    -d "include_path=${TEST_DIRECTORY}/../:${TEST_DIRECTORY}/../.pear/pear/php" \
    "${TEST_DIRECTORY}/../.pear/pear/phpunit" \
    "${TEST_DIRECTORY}/Suite.php"

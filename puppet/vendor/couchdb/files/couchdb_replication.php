#!/usr/bin/env php
<?php
function printUsage($exitCode = -1) 
{
    $commandName = $_SERVER['argv'][0];
    echo <<<EOM
Usage: 
    $commandName <command> <couchdb> <source> <target>

Sets up, checks for or deletes a continous couchdb replication.
Command can be one of: 

Requires: 
    command line curl

Examples:
    $commandName add      http://localhost:5984 http://sourcehost:5984/source_db http://targethost:5984/target_db
    $commandName remove   http://localhost:5984 http://sourcehost:5984/source_db http://targethost:5984/target_db
    $commandName exists   http://localhost:5984 http://sourcehost:5984/source_db http://targethost:5984/target_db
    $commandName progress http://localhost:5984 http://sourcehost:5984/source_db http://targethost:5984/target_db
The examples configure a replication on the local couchdb host from database
source_db on sourcehost to target_db on targethost.

EOM;
    exit(1);
}

if ($argc < 5) {
    printUsage();
}

$command = $argv[1];
$couchdb = $argv[2];
$source  = $argv[3];
$target  = $argv[4];


function createReplicationDocument($source, $target)
{
    return json_encode(
        array(
            "worker_batch_size" => 50,
            "source"            => $source,
            "target"            => $target,
            "create_target"     => true,
            "continuous"        => true,
        )
    );
}

function getReplicationDocumentName($source, $target)
{
    return md5(sha1($source) . sha1($target));
}

$replicationId = getReplicationDocumentName($source, $target);

switch ($command) {
    case 'add':
        $response = json_decode(shell_exec('curl --silent -X PUT ' . $couchdb . '/_replicator/' . $replicationId . ' -d \'' . createReplicationDocument($source, $target) . '\'' . PHP_EOL));
        if (isset($response->ok) && $response->ok === true) {
            exit(0);
        }
        var_dump($response);
        exit(1);
        break;
    case 'remove':
        $response = json_decode(shell_exec('curl --silent -X GET ' . $couchdb . '/_replicator/' . $replicationId));
        if (isset($response->error) && $response->error === 'not_found') {
            exit(0);
        }
        shell_exec('curl --silent -X DELETE ' . $couchdb . '/_replicator/' . $replicationId . '?rev=' . $response->_rev);
        break;
    case 'exists':
        $response = json_decode(shell_exec('curl --silent -X GET ' . $couchdb . '/_replicator/' . $replicationId));
        if (isset($response->_id) && $response->_id === $replicationId) {
            exit(0);
        }
        var_dump($response);
        exit(1);
        break;
    case 'progress':
        $activeTasks = json_decode(shell_exec('curl --silent -X GET ' . $couchdb . '/_active_tasks'));
        foreach ($activeTasks as $activeTask) {
            if (isset($activeTask->type) && $activeTask->type === 'replication' && isset($activeTask->doc_id) && $activeTask->doc_id === $replicationId) {
                exit(100 - $activeTask->progress);
            }
        }
        exit(255);
        break;
   default:
       exit(254);
}

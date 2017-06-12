"use strict";

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 4) {
  console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
  console.log('Example:');
  console.log(
    'node ReplicationManager.js "http://admin:bar@192.168.222.20:5984/" "http://foo:bar@192.168.222.20:5984/" "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" "labeling_api_read_only"');
  process.exit(1);
}

var maxReplications = 50;
var compactReplicationDbCycle = 500;
var compactReplicationCounter = 0;

var adminUrl = process.argv[2];
var ReplicationUrl = process.argv[3];
var sourceDbRegex = process.argv[4];
var targetDb = process.argv[5];

var queue = [];
var activeTasks = [];

var md5 = require('md5');
var nanoAdmin = require('nano')(adminUrl);

listenToReplicationChanges();
listenToDatabaseChanges();
addOneTimeReplicationForAllDatabases();

function listenToReplicationChanges() {
  var replicatorDb = nanoAdmin.use('_replicator');
  var feedReplicator = replicatorDb.follow({include_docs: true});

  feedReplicator.filter = function(doc, req) {
    return !doc._deleted;
  }

  feedReplicator.on('change', function(change) {
    if (change.doc._replication_state === "completed") {
      destroyAndPurge(replicatorDb, change.doc._id, change.doc._rev);
      var index = activeTasks.indexOf(change.doc._id);
      if (index !== -1) {
        activeTasks.splice(index, 1);
      }
      queueWorker();
    }
  });
  feedReplicator.follow();
}

function listenToDatabaseChanges() {
  var db = nanoAdmin.use('_db_updates');
  var feed = db.follow({include_docs: true, since: "now"});

  feed.on('change', function(change) {
    var updated_db = change.db_name;
    if (updated_db.match(sourceDbRegex) !== null) {
      addJobToQueue(updated_db, targetDb);
    }
  });
  feed.follow();
}

function addJobToQueue(source, target) {
  queue.push(
    {
      id: getReplicationDocumentIdName(source, target),
      source: source,
      target: target
    }
  );
  queue = removeDuplicates(queue, 'id');
  queueWorker();
}

function removeDuplicates(arr, prop) {
  var new_arr = [];
  var lookup = {};

  for (var i in arr) {
    lookup[arr[i][prop]] = arr[i];
  }

  for (i in lookup) {
    new_arr.push(lookup[i]);
  }

  return new_arr;
}

function queueWorker() {
  if (activeTasks.length >= maxReplications || queue.length === 0) {
    console.log('active tasks: ' + activeTasks.length + '/' + maxReplications + ' | Queue length: ' + queue.length);

    return false;
  }

  var element = queue.shift();
  activeTasks.push(getReplicationDocumentIdName(element.source, element.target));
  var replicatorDb = nanoAdmin.use('_replicator');
  replicatorDb.insert(
    {
      "worker_batch_size": 50,
      "source": ReplicationUrl + element.source,
      "target": ReplicationUrl + element.target,
      "continuous": false
    },
    getReplicationDocumentIdName(element.source, element.target),
    function(err, body) {
      if (err) {
        var index = activeTasks.indexOf(getReplicationDocumentIdName(element.source, element.target));
        if (index !== -1) {
          activeTasks.splice(index, 1);
        }
        queueWorker();
      }
    }
  );
  compactReplicationDatabase();

  console.log('active tasks: ' + activeTasks.length + '/' + maxReplications + ' | Queue length: ' + queue.length);
}

function compactReplicationDatabase() {
  compactReplicationCounter += 1;
  if (compactReplicationCounter >= compactReplicationDbCycle) {
    console.log('Starting _replicator compaction');
    nanoAdmin.db.compact('_replicator');
    compactReplicationCounter = 0;
  }
}

function destroyAndPurge(db, documentId, revision, callback) {
  db.get(documentId, {revs_info: true}, function(err, body) {
    if (err) {
      return callback(err);
    }

    const revisions = body._revs_info.map(function(revInfo) {
      return revInfo.rev
    }).reverse();

    db.destroy(documentId, revision, function(err, body) {
      if (err) {
        return callback(err);
      }

      revisions.push(body.rev);

      let purgeBody = {};
      purgeBody[documentId] = revisions;

      nanoAdmin.request({
                          db: db.config.db,
                          method: 'post',
                          path: '_purge',
                          body: purgeBody
                        }, callback);
    })
  });
}

function getReplicationDocumentIdName(source, target) {
  return 'replication-manager-' + md5(source + target);
}

/**
 * This method add a one-time replication for all matching sources databases to the target database
 */
function addOneTimeReplicationForAllDatabases() {
  console.log('Creating a one-time replication for all matching databases now.');
  nanoAdmin.db.list(function(err, body) {
    body.forEach(function(databaseNames) {
      if (databaseNames.match(sourceDbRegex) !== null) {
        addJobToQueue(databaseNames, targetDb);
      }
    });
  });
}
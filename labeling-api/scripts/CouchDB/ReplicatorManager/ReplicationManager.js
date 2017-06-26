"use strict";

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 4) {
  console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
  console.log('Example:');
  console.log(
    'node ReplicationManager.js "http://admin:bar@192.168.222.20:5984/" "http://foo:bar@192.168.222.20:5984/" "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" "labeling_api_read_only"');
  process.exit(1);
}

let maxReplications = 50;
let compactReplicationDbCycle = 500;
let compactReplicationCounter = 0;

let adminUrl = process.argv[2];
let ReplicationUrl = process.argv[3];
let sourceDbRegex = process.argv[4];
let targetDb = process.argv[5];

let queue = [];
let activeTasks = [];

let md5 = require('md5');
let nanoAdmin = require('nano')(adminUrl);

purgeAllPreviousManagedReplicationLeftOvers(function(error) {
  if (error) {
    console.error('ERROR: ', error);
    return;
  }

  addOneTimeReplicationForAllDatabases(function(error) {
    if (error) {
      console.error('ERROR: ', error);
      return;
    }

    listenToReplicationChanges();
    listenToDatabaseChanges();
    doWork();
  });
});

function listenToReplicationChanges() {
  const replicatorDb = nanoAdmin.use('_replicator');
  const feedReplicator = replicatorDb.follow({include_docs: true});

  feedReplicator.filter = function(doc, req) {
    return !doc._deleted;
  };

  feedReplicator.on('change', function(change) {
    if (change.doc._replication_state === "completed") {
      destroyAndPurge(replicatorDb, change.doc._id, change.doc._rev, function() {
        const index = activeTasks.indexOf(change.doc._id);
        if (index !== -1) {
          activeTasks.splice(index, 1);
        }
        doWork();
      });
    }
  });
  feedReplicator.follow();
}

function listenToDatabaseChanges() {
  const db = nanoAdmin.use('_db_updates');
  const feed = db.follow({include_docs: true, since: "now"});

  feed.on('change', function(change) {
    const updated_db = change.db_name;
    if (updated_db.match(sourceDbRegex) !== null) {
      addJobToQueue(updated_db, targetDb);
    }
  });
  feed.follow();
}

function addJobToQueue(source, target, doNotProcessChange) {
  queue.push(
    {
      id: getReplicationDocumentIdName(source, target),
      source: source,
      target: target
    }
  );
  queue = removeDuplicates(queue, 'id');

  if (doNotProcessChange === true) {
    return;
  }

  doWork();
}

function removeDuplicates(arr, prop) {
  const new_arr = [];
  const lookup = {};

  for (var i in arr) {
    lookup[arr[i][prop]] = arr[i];
  }

  for (i in lookup) {
    new_arr.push(lookup[i]);
  }

  return new_arr;
}

function doWork() {
  setImmediate(function() {
    queueWorker();
  });
}

function queueWorker() {
  if (activeTasks.length >= maxReplications || queue.length === 0) {
    console.log('active tasks: ' + activeTasks.length + '/' + maxReplications + ' | Queue length: ' + queue.length);

    return false;
  }

  const element = queue.shift();
  activeTasks.push(getReplicationDocumentIdName(element.source, element.target));
  const replicatorDb = nanoAdmin.use('_replicator');
  const replicationDocument = {
        "worker_batch_size": 50,
        "source": ReplicationUrl + element.source,
        "target": ReplicationUrl + element.target,
        "continuous": false
      };
  const replicationId = getReplicationDocumentIdName(element.source, element.target);

  replicatorDb.insert(
    replicationDocument,
    replicationId,
    function(err, body) {
      if (err) {
        console.error('ERROR inserting replication: ', err, replicationId, replicationDocument);
        const index = activeTasks.indexOf(getReplicationDocumentIdName(element.source, element.target));
        if (index !== -1) {
          activeTasks.splice(index, 1);
        }
      }
      doWork();
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

      purgeDocument(db, documentId, revisions, callback);
    })
  });
}

function purgeDocument(db, documentId, revisions, next) {
  const purgeBody = {};
  purgeBody[documentId] = revisions;
  nanoAdmin.request({
    db: db.config.db,
    method: 'post',
    path: '_purge',
    body: purgeBody
  }, next);
}

function getReplicationDocumentIdName(source, target) {
  return 'replication-manager-' + md5(source + target);
}

/**
 * This method add a one-time replication for all matching sources databases to the target database
 */
function addOneTimeReplicationForAllDatabases(next) {
  console.log('Creating a one-time replication for all matching databases now.');
  nanoAdmin.db.list(function(err, body) {
    if (err) {
      return next(err);
    }

    body.forEach(function(databaseNames) {
      if (databaseNames.match(sourceDbRegex) !== null) {
        addJobToQueue(databaseNames, targetDb, true);
      }
    });

    next();
  });
}

function purgeAllPreviousManagedReplicationLeftOvers(next) {
  console.log('Purging all possible left overs from previous replication runs');
  const purgeQueue = [];
  const db = nanoAdmin.use('_replicator');
  nanoAdmin.db.list(function(err, body) {
    if (err) {
      return next(err);
    }

    body.forEach(function(databaseName) {
      if (databaseName.match(sourceDbRegex) !== null) {
        purgeQueue.push(getReplicationDocumentIdName(databaseName, targetDb))
      }
    });

    function purgeNextDb() {
      if (purgeQueue.length === 0) {
        return next();
      }
      const documentId = purgeQueue.shift();

      db.get(documentId, {revs: true, open_revs: 'all'}, function(err, results) {
        if (err) {
          return next(err);
        }

        // There should only be one or none ok result
        const okResult = results.find(function(result) {
          return ('ok' in result);
        });

        if (okResult === undefined) {
          return purgeNextDb();
        } else if (okResult.ok._deleted === true) {
          const revisions = okResult.ok._revisions.ids.map(function(hash, index) {
            return '' + (okResult.ok._revisions.ids.length - index) + '-' + hash;
          });

          return purgeDocument(db, documentId, revisions, function(err) {
            if (err) {
              return next(err);
            }

            return purgeNextDb();
          });
        } else {
          return destroyAndPurge(db, documentId, okResult.ok._rev, function(err) {
            if (err) {
              return next(err);
            }

            return purgeNextDb();
          });
        }
      });
    }

    purgeNextDb();
  });
}
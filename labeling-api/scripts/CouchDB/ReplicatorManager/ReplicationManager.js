if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 4) {
  console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
  console.log('Example:');
  console.log(
    'node ReplicationManager.js "http://admin:bar@192.168.222.20:5984/" "http://foo:bar@192.168.222.20:5984/" "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" "labeling_api_read_only"');
  process.exit(1);
}

var maxReplications = 50;

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
AddOneTimeReplicationForAllDatabases();
addOneTimeReplicationForAllDatabases();

function listenToReplicationChanges() {
  var replicatorDb = nanoAdmin.use('_replicator');
  var feedReplicator = replicatorDb.follow({include_docs: true});

  feedReplicator.on('change', function(change) {
    if (change.doc._replication_state === "completed") {
      replicatorDb.destroy(change.doc._id, change.doc._rev);
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
  var feed = db.follow({include_docs: true});

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
      id: md5(source + target),
      source: source,
      target: target
    }
  );
  queueWorker();
}

function queueWorker() {
  if (activeTasks.length >= maxReplications) {
    return false;
  }

  if (queue.length > 0) {
    var element = queue.shift();
    if (activeTasks.indexOf(md5(element.source + element.target)) === -1) {
      activeTasks.push(md5(element.source + element.target));
      var replicatorDb = nanoAdmin.use('_replicator');
      replicatorDb.insert(
        {
          "worker_batch_size": 50,
          "source": ReplicationUrl + element.source,
          "target": ReplicationUrl + element.target,
          "continuous": false
        },
        md5(element.source + element.target),
        function(err, body) {
          if (err) {
            var index = activeTasks.indexOf(md5(element.source + element.target));
            if (index !== -1) {
              activeTasks.splice(index, 1);
            }
            queueWorker();
          }
        }
      );
    }
  }

  console.log('active tasks: ' + activeTasks.length + '/' + maxReplications + ' | Queue length: ' + queue.length);
}

/**
 * This method add a one-time replication for all matching sources databases to the target database
 */
function addOneTimeReplicationForAllDatabases() {
  console.log('Creating a one-time replication for all matching databases now.');
  nanoAdmin.db.list(function(err, body) {
    body.forEach(function(db) {
      if (db.match(sourceDbRegex) !== null) {
        addJobToQueue(db, targetDb);
      }
    });
  });
}
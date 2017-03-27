if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 5) {
  console.log('Usage: ReplicationManager.js [hostname] [port] [targetDb] [sourceDbRegex]');
  console.log('Example:');
  console.log(
    'node ReplicationManager.js 192.168.222.20 5984 "labeling_api" "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)\w+"');
  process.exit(1);
}

var hostname = process.argv[2];
var port = process.argv[3];
var targetDb = process.argv[4];
var sourceDbRegex = process.argv[5];

var nano = require('nano')('http://' + hostname + ':' + port);
var db = nano.use('_db_updates')
var feed = db.follow({since: "now"});

feed.on('change', function(change) {
  var updated_db = change.db_name;

  if (updated_db.match(sourceDbRegex) !== null) {
    nano.db.replicate(updated_db, targetDb, {continuous: false}, function(err, body) {
      if (!err) {
        console.log('Added non-continuous replication from "' + change.db_name + '" to "' + targetDb + '"');
      }else{
        console.error('FAILED to add non-continuous replication from "' + change.db_name + '" to "' + targetDb + '"')
      }
    });
  }
});

console.log('Listing now on the changed feed!');
feed.follow();

AddOneTimeReplicationForAllDatabases();

/**
 * This method add a one-time replication for all matching sources databases to the target database
 */
function AddOneTimeReplicationForAllDatabases() {
  console.log('Creating a one-time replication for all matching databases now.');
  nano.db.list(function(err, body) {
    body.forEach(function(db) {
      if (db.match(sourceDbRegex) !== null) {
        nano.db.replicate(db, targetDb, {continuous: false}, function(err, body) {
          if (!err) {
            console.log('Added startup non-continuous replication from ' + db + '" to "' + targetDb + '"');
          }else{
            console.error('FAILED to added startup non-continuous replication from ' + db + '" to "' + targetDb + '"')
          }
        });
      }
    });
  });
}
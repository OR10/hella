"use strict";

/**
 * This script triggers a compaction for each task database in chunks of 100 dbs at a time
 */

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 2) {
  console.log('Usage: ' + process.argv[0] + ' [adminUrl]');
  process.exit(1);
}

const adminUrl = process.argv[2];

const nano = require('nano')(adminUrl);
const taskDbRegex = /taskdb-project-[a-z0-9_-]+-task-[a-z0-9_-]+/;

const dbQueue = [];
let queueCounter = 0;

function processDbQueue() {
  if (dbQueue.length === 0) {
    return;
  }

  queueCounter++;
  const dbName = dbQueue.shift();
  console.log('Triggering compaction for next db [' + queueCounter + ' / ' + (queueCounter + dbQueue.length - 1) + '] - ' + dbName);
  const db = nano.use(dbName);
  nano.db.compact(dbName, function(error) {
    if (error) {
      console.error('ERROR: ' + error);
      return;
    }
    return processDbQueue();
  });
}


nano.db.list(function(err, dbNames) {
  if (err) {
    console.error('ERROR: ' + err);
    return;
  }
  dbNames.forEach(function(dbName) {
    if (dbName.match(taskDbRegex) !== null) {
      dbQueue.push(dbName);
      console.log('Queued database: ' + dbName);
    }
  });
  processDbQueue();
});
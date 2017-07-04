"use strict";

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 2) {
  console.log('Usage: ReplicationManager.js [adminUrl]');
  process.exit(1);
}

const adminUrl = process.argv[2];

const nanoAdmin = require('nano')(adminUrl);
const taskDbRegex = /taskdb-project-[a-z0-9_-]+-task-[a-z0-9_-]+/;

const dbQueue = [];
let queueCounter = 0;

function processDbQueue() {
  queueCounter++;
  const dbName = dbQueue.shift();
  console.log('Processing next db [' + queueCounter + ' / ' + (queueCounter + dbQueue.length - 1) + '] - ' + dbName);
  const db = nanoAdmin.use(dbName);

  db.list({include_docs: true}, function(err, body) {
    const bulkUpdates = [];
    if (err) {
      console.error('ERROR: ' + err);
      return;
    }

    const documents = body.rows;

    documents.forEach(function(rawDocument) {
      const document = rawDocument.doc;

      // console.log(document);
      if (document.type !== 'AppBundle.Model.LabeledThingInFrame') {
        return;
      }

      if (document.identifierName !== null) {
        return;
      }

      document.identifierName = 'legacy';

      bulkUpdates.push(document);
      console.log('Queued ' + document._id + ' for migration');
    });

    if (bulkUpdates.length === 0) {
      console.log('Nothing to be updated in db: ' + dbName);
      if (dbQueue.length > 0) {
        processDbQueue();
      }
      return;
    }

    console.log('Executing bulk updates ' + bulkUpdates.length);

    db.bulk({docs: bulkUpdates}, function(err, results) {
      if (err) {
        console.log(bulkUpdates);
        console.error(err);
        return;
      }

      console.log('Bulk update finished');
      results.forEach(function(result) {
        if (result.error) {
          console.error('ERROR: Update failed for document ' + result.id + ': ' + result.error + ' / ' + result.reason);
        }
      });

      if (dbQueue.length > 0) {
        processDbQueue();
      }
    });
  });
}


nanoAdmin.db.list(function(err, dbNames) {
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
"use strict";

/**
 * We are partially storing `labeledThingInFrameId` values on shapes within a ltif.
 *
 * Some documents have this property, others don't. We however do not use this information anywhere.
 * This script removes all of those still existing entries.
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
  console.log('Processing next db [' + queueCounter + ' / ' + (queueCounter + dbQueue.length - 1) + '] - ' + dbName);
  const db = nano.use(dbName);

  const ltifs = [];
  const bulkUpdates = [];

  function addLtif(ltif) {
    ltifs.push(ltif);
  }

  db.list({include_docs: true}, function(err, body) {
    if (err) {
      console.error('ERROR: ' + err);
      return;
    }

    const rows = body.rows;

    rows.forEach(function(row) {
      const document = row.doc;
      if (document.type === 'AppBundle.Model.LabeledThingInFrame') {
        addLtif(document);
      }
    });

    ltifs.forEach(function(ltif) {
      let updateRequired = false;
      ltif.shapes.forEach(function(shape, index) {
        if (!('labeledThingInFrameId' in shape)) {
          return;
        }
        console.log('Removing labeledThingInFrameId property for ltif.shapes[' + index + '] with ltif._id = ' + ltif._id);
        delete shape.labeledThingInFrameId;
        updateRequired = true;
      });
      if (updateRequired) {
        bulkUpdates.push(ltif);
      }
    });

    if (bulkUpdates.length === 0) {
      // console.log('Nothing to be updated in db: ' + dbName);
      return processDbQueue();
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

      return processDbQueue();
    });
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
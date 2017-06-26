"use strict";

/**
 * There was an error in the system, which could cause a set of completed LTIFs to still have their LT marked
 * incomplete.
 *
 * This migration scans all TaskDBs for their LTIFs and sets all corresponding LTs with a correct incomplete flag.
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

  const lts = new Map();
  const ltifs = new Map();
  const bulkUpdates = [];

  function addLt(lt) {
    lts.set(lt._id, lt);
  }

  function addLtif(ltif) {
    let ltifsForLt;
    if (!ltifs.has(ltif.labeledThingId)) {
      ltifsForLt = [];
      ltifs.set(ltif.labeledThingId, ltifsForLt);
    } else {
      ltifsForLt = ltifs.get(ltif.labeledThingId);
    }

    ltifsForLt.push(ltif);
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
      } else if (document.type === 'AppBundle.Model.LabeledThing') {
        addLt(document);
      }
    });

    ltifs.forEach(function(ltifsForLt, ltId) {
      if (!lts.has(ltId)) {
        console.error('Found LTIFS for non existent LT: ', ltId);
        return;
      }

      const lt = lts.get(ltId);
      const ltifsAreIncomplete = ltifsForLt.reduce(function(isIncomplete, currentLtif) {
        return isIncomplete || currentLtif.incomplete;
      }, false);

      if (lt.incomplete !== ltifsAreIncomplete) {
        console.log('Found mismatching incompletes: lt = ' + lt.incomplete + ', ltifs = ' + ltifsAreIncomplete);

        lt.incomplete = ltifsAreIncomplete;
        bulkUpdates.push(lt);
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
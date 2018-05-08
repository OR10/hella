"use strict";

if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 2) {
  console.log('Usage: ReplicationManager.js [adminUrl]');
  process.exit(1);
}

const adminUrl = process.argv[2];
const projectId = process.argv[3];

const nanoAdmin = require('nano')(adminUrl);

let taskDbRegex = /taskdb-project-[a-z0-9_-]+-task-[a-z0-9_-]+/;
if (projectId !== undefined) {
    taskDbRegex = new RegExp("taskdb-project-" + projectId + "-task-[a-z0-9_-]+");
}

const dbQueue = [];
let queueCounter = 0;

function processDbQueue() {
  queueCounter++;
  const dbName = dbQueue.shift();
  const allreadyDeleted = [];
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

      const shapeType = document.shapes[0].type;
      if (allreadyDeleted.indexOf(document.labeledThingId) !== -1 ){
        return;
      }
      const ltifWithSameShape = documents.find(function (rawDocument1) {
        if (rawDocument1.doc.type === 'AppBundle.Model.LabeledThingInFrame') {
          const condition1 = rawDocument1.doc.shapes[0].type === shapeType;
          const condition2 = rawDocument1.id === document._id;
          if (condition1 && !condition2) {
            if (filterForCoordinates(shapeType, document.shapes[0],rawDocument1.doc.shapes[0]))
              if (rawDocument1.doc.classes.length < document.classes) {
                return document
              } else {
                return rawDocument1;
              }
          }
        }
      });
      if (ltifWithSameShape !== undefined) {
        console.log('Delete ltif with lt.id: ' + ltifWithSameShape.doc.labeledThingId + 'doc.id: ' + ltifWithSameShape.id);
        allreadyDeleted.push(ltifWithSameShape.doc.labeledThingId);
        db.destroy(ltifWithSameShape.id, ltifWithSameShape.doc._rev, function(err, body) {
            if (!err)
              console.log(body);
        });
      }
      // bulkUpdates.push(document);
      // console.log('Queued ' + document._id + ' for migration');
    });

    if (bulkUpdates.length === 0) {
      console.log('Nothing to be updated in db: ' + dbName);
      if (dbQueue.length > 0) {
        processDbQueue();
      }
      return;
    }

    // console.log('Executing bulk updates ' + bulkUpdates.length);

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

  function filterForCoordinates(type, shape1, shape2) {
    switch (type){
      case 'rectangle':
          return compareRectangle(shape1, shape2);
        break;
      case 'cuboid3d':
          return compareCuboid(shape1, shape2);
        break;
      case 'pedestrian':
          return comparePedestrian(shape1, shape2);
          break;
      case 'polygon':
          return comparePolylinePolygon(shape1, shape2);
          break;
      case 'polyline':
          return comparePolylinePolygon(shape1, shape2);
          break;
      case 'point':
          return comparePoint(shape1, shape2);
          break;
      default:
            return false;
    }
  }

  function compareRectangle(shape1, shape2) {
    return JSON.stringify(shape1.topLeft) === JSON.stringify(shape2.topLeft) && JSON.stringify(shape1.bottomRight) === JSON.stringify(shape2.bottomRight);
  }
  function compareCuboid(shape1, shape2) {
    return JSON.stringify(shape1.vehicleCoordinates) === JSON.stringify(shape2.vehicleCoordinates);
  }
  function comparePedestrian(shape1, shape2) {
    return JSON.stringify(shape1.topCenter) === JSON.stringify(shape2.topCenter) && JSON.stringify(shape1.bottomCenter) === JSON.stringify(shape2.bottomCenter);
  }
  function comparePolylinePolygon(shape1, shape2) {
    return JSON.stringify(shape1.points) === JSON.stringify(shape2.points);
  }
  function comparePoint(shape1, shape2) {
    return JSON.stringify(shape1.point) === JSON.stringify(shape2.point);
  }
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
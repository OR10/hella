if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv.length <= 4) {
    console.log('Usage: ' + process.argv[0] + ' [adminUrl] [docType] [property]');
    process.exit(1);
}

const adminUrl = process.argv[2];
const docType = process.argv[3];
const property = process.argv[4];

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

    const bulkUpdates = [];

    db.list({include_docs: true}, function(err, body) {
        if (err) {
            console.error('ERROR: ' + err);
            return;
        }

        const rows = body.rows;

        rows.forEach(function (row) {
            const document = row.doc;
            if (document.type === docType && document[property]) {
                delete document[property];
                bulkUpdates.push(document);
            }
        });

        db.bulk({docs: bulkUpdates}, function(err, results) {
            if (err) {
                console.log(bulkUpdates);
                console.error(err);
                return;
            }

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
const { CommandLineArgs } = require('./CommandLineArgs');
const { Replicator } = require('./Jobs/Replicator');
const { Worker } = require('./Worker');
const { Utils } = require('./Utils');

class ReplicationManager {
  run() {
    const options = CommandLineArgs.parse();
    this.adminUrl = options.adminUrl;
    this.sourceBaseUrl = options.sourceBaseUrl;
    this.targetBaseUrl = options.targetBaseUrl;
    this.sourceDbRegex = options.sourceDbRegex;
    this.targetDb = options.targetDb;
    this.hotStandByUrl = options.hotStandByUrl;
    /* eslint-disable global-require */
    this.nanoAdmin = require('nano')(this.adminUrl);
    /* eslint-enable global-require */
    this.worker = new Worker(this.nanoAdmin);

    this.purgeAllPreviousManagedReplicationLeftOvers().then(() => {
      this.addOneTimeReplicationForAllDatabases();
      this.worker.listenToReplicationChanges();
      this.listenToDatabaseChanges();
    });
  }

  listenToDatabaseChanges() {
    // eslint-disable-next-line no-console
    console.log('Listen to the changes feed now.');
    const db = this.nanoAdmin.use('_db_updates');
    const feed = db.follow({ include_docs: true, since: 'now' });

    feed.on('change', change => {
      const updatedDb = change.db_name;
      if (updatedDb.match(this.sourceDbRegex) !== null) {
        this._addWorkerJob(updatedDb, this.targetDb);
      }
    });
    feed.follow();
  }

  addOneTimeReplicationForAllDatabases() {
    // eslint-disable-next-line no-console
    console.log('Creating a one-time replications for all matching databases now.');
    this.nanoAdmin.db.list((err, body) => {
      if (err) {
        return err;
      }

      body.forEach(databaseNames => {
        if (databaseNames.match(this.sourceDbRegex) !== null) {
          this._addWorkerJob(databaseNames, this.targetDb);
        }
      });

      return true;
    });
  }

  purgeAllPreviousManagedReplicationLeftOvers() {
    // eslint-disable-next-line no-console
    console.log('Purging all possible left overs from previous replication runs');
    const documentsToPurge = [];
    return new Promise((resolve, reject) => {
      this.nanoAdmin.db.list((err, body) => {
        if (err) {
          return reject(err);
        }

        body.forEach(databaseName => {
          if (databaseName.match(this.sourceDbRegex) !== null) {
            documentsToPurge.push(
              this._purgeCouchDbReplicationDocument(databaseName, this.targetDb),
            );
          }
        });

        Promise.all(documentsToPurge).then(() => {
          resolve();
        });

        return true;
      });
    });
  }

  /**
   * Remove an old replication document
   * @param sourceDatabase
   * @param targetDatabase
   * @private
   */
  _purgeCouchDbReplicationDocument(sourceDatabase, targetDatabase) {
    const documentsToPurge = [];
    if (this.hotStandByUrl !== undefined) {
      const sourceUrl = this.sourceBaseUrl + sourceDatabase;
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      documentsToPurge.push(
        Utils.purgeCouchDbReplicationDocument(
          this.nanoAdmin,
          Utils.getReplicationDocumentIdName(sourceUrl, targetUrl),
        ),
      );
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    documentsToPurge.push(
      Utils.purgeCouchDbReplicationDocument(
        this.nanoAdmin,
        Utils.getReplicationDocumentIdName(sourceUrl, targetUrl),
      ),
    );

    return Promise.all(documentsToPurge);
  }

  /**
   * Add the replication job(s) to the worker
   * @param {string} sourceDatabase
   * @param {string} targetDatabase
   * @private
   */
  _addWorkerJob(sourceDatabase, targetDatabase) {
    if (this.hotStandByUrl !== undefined) {
      const sourceUrl = this.sourceBaseUrl + sourceDatabase;
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      const job = new Replicator(this.nanoAdmin, sourceUrl, targetUrl);
      this.worker.addJob(job);
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    const job = new Replicator(this.nanoAdmin, sourceUrl, targetUrl);
    this.worker.addJob(job);
  }
}

const ReplicationManagerStarter = new ReplicationManager();
ReplicationManagerStarter.run();

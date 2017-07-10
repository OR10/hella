const { CommandLineArgs } = require('./CommandLineArgs');
const { Replicator } = require('./Jobs/Replicator');
const { WorkerQueue } = require('./WorkerQueue');
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
    const nano = require('nano');
    this.nanoAdmin = nano(this.adminUrl);
    /* eslint-enable global-require */
    this.workerQueue = new WorkerQueue(this.nanoAdmin);

    this.purgeAllPreviousManagedReplicationLeftOvers().then(() => {
      this.addOneTimeReplicationForAllDatabases();
      this.workerQueue.listenToReplicationChanges();
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
    const purgePromises = [];
    return new Promise((resolve, reject) => {
      this.nanoAdmin.db.list((err, body) => {
        if (err) {
          return reject(err);
        }

        body.forEach(databaseName => {
          if (databaseName.match(this.sourceDbRegex) !== null) {
            purgePromises.push(
              this._purgeCouchDbReplicationDocument(databaseName, this.targetDb),
            );
          }
        });

        Promise.all(purgePromises).then(() => {
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
    const purgePromises = [];
    if (this.hotStandByUrl !== undefined) {
      const sourceUrl = this.sourceBaseUrl + sourceDatabase;
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      purgePromises.push(
        Utils.purgeCouchDbReplicationDocument(
          this.nanoAdmin,
          Utils.getReplicationDocumentIdName(sourceUrl, targetUrl),
        ),
      );
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    purgePromises.push(
      Utils.purgeCouchDbReplicationDocument(
        this.nanoAdmin,
        Utils.getReplicationDocumentIdName(sourceUrl, targetUrl),
      ),
    );

    return Promise.all(purgePromises);
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
      this.workerQueue.addJob(job);
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    const job = new Replicator(this.nanoAdmin, sourceUrl, targetUrl);
    this.workerQueue.addJob(job);
  }
}

const ReplicationManagerStarter = new ReplicationManager();
ReplicationManagerStarter.run();

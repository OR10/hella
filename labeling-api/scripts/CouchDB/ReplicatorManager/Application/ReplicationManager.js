const {Replicator} = require('./Jobs/Replicator');

const {purgeCouchDbReplicationDocument, getReplicationDocumentIdName} = require('./Utils');

class ReplicationManager {
  constructor(logger, nanoAdmin, workerQueue, options) {
    this.logger = logger;
    this.nanoAdmin = nanoAdmin;
    this.workerQueue = workerQueue;
    this.options = options;
    this.purgeQueue = [];
  }

  run() {
    this.adminUrl = this.options.adminUrl;
    this.sourceBaseUrl = this.options.sourceBaseUrl;
    this.targetBaseUrl = this.options.targetBaseUrl;
    this.sourceDbRegex = this.options.sourceDbRegex;
    this.targetDb = this.options.targetDb;
    this.hotStandByUrl = this.options.hotStandByUrl;

    Promise.resolve()
      .then(() => this.purgeAllPreviousManagedReplicationLeftOvers())
      .then(() => this.addOneTimeReplicationForAllDatabases())
      .then(() => this.workerQueue.listenToReplicationChanges())
      .then(() => this.listenToDatabaseChanges())
      .catch(error => {
        this.logger.logString(`Startup failed: ${error}`);
        process.exit(1);
      });
  }

  listenToDatabaseChanges() {
    this.logger.logString('Listen to the changes feed now.');
    const db = this.nanoAdmin.use('_db_updates');
    const feed = db.follow({include_docs: true, since: 'now'});

    feed.on('change', change => {
      if (change.type === undefined || change.db_name === undefined) {
        return;
      }

      const updatedDb = change.db_name;

      switch (change.type) {
        case 'updated':
          if (updatedDb.match(this.sourceDbRegex) !== null) {
            this._addWorkerJob(updatedDb, this.targetDb);
          }
          break;
        case 'deleted':
          this._removeWorkerJob(updatedDb, this.targetDb);
          break;
        default:
          this.logger.logString(`Ignored _changes item for type ${change.type}`);
      }
    });
    feed.on('error', er => {
      this.logger.logString('_listenToDatabaseChanges');
      throw er;
    });
    feed.follow();
  }

  addOneTimeReplicationForAllDatabases() {
    this.logger.logString('Creating a one-time replications for all matching databases now.');
    return new Promise((resolve, reject) => {
      this.nanoAdmin.db.list((err, body) => {
        if (err) {
          reject(err);

          return;
        }

        body.forEach(databaseNames => {
          if (databaseNames.match(this.sourceDbRegex) !== null) {
            this._addWorkerJob(databaseNames, this.targetDb);
          }
        });

        resolve();
      });
    });
  }

  purgeAllPreviousManagedReplicationLeftOvers() {
    this.logger.logString('Purging all possible left overs from previous replication runs');
    return new Promise((resolve, reject) => {
      this.nanoAdmin.db.list((err, body) => {
        if (err) {
          return reject(err);
        }

        body.forEach(databaseName => {
          if (databaseName.match(this.sourceDbRegex) !== null) {
            this.purgeQueue.push(databaseName);
          }
        });
        this._prugeNextPurgeQueue(resolve);

        return true;
      });
    });
  }

  _prugeNextPurgeQueue(resolve) {
    if (this.purgeQueue.length === 0) {
      resolve();
      return true;
    }

    const databaseName = this.purgeQueue.shift();
    this._purgeCouchDbReplicationDocument(databaseName, this.targetDb).then(() => {
      this._prugeNextPurgeQueue(resolve);
    });

    return true;
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
        purgeCouchDbReplicationDocument(
          this.nanoAdmin,
          getReplicationDocumentIdName(sourceUrl, targetUrl),
          this.logger,
        ),
      );
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    purgePromises.push(
      purgeCouchDbReplicationDocument(
        this.nanoAdmin,
        getReplicationDocumentIdName(sourceUrl, targetUrl),
        this.logger,
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
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      const job = new Replicator(this.nanoAdmin, this.sourceBaseUrl, sourceDatabase, targetUrl);
      this.workerQueue.addJob(job);
    }
    const targetUrl = this.targetBaseUrl + targetDatabase;
    const job = new Replicator(this.nanoAdmin, this.sourceBaseUrl, sourceDatabase, targetUrl);
    this.workerQueue.addJob(job);
  }

  _removeWorkerJob(sourceDatabase, targetDatabase) {
    if (this.hotStandByUrl !== undefined) {
      const sourceUrl = this.sourceBaseUrl + sourceDatabase;
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      const id = getReplicationDocumentIdName(sourceUrl, targetUrl);
      this.workerQueue.removeJob(id);
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.targetBaseUrl + targetDatabase;
    const id = getReplicationDocumentIdName(sourceUrl, targetUrl);
    this.workerQueue.removeJob(id);
  }
}

exports.ReplicationManager = ReplicationManager;

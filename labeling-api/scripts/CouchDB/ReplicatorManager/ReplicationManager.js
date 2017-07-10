const commandLineArgs = require('command-line-args');
const { Replicator } = require('./Jobs/Replicator');
const { Worker } = require('./Worker');
const { Utils } = require('./Utils');

class ReplicationManager {
  constructor() {
    const optionDefinitions = [
      { name: 'adminUrl', type: String },
      { name: 'sourceBaseUrl', type: String },
      { name: 'targetBaseUrl', type: String },
      { name: 'hotStandByUrl', type: String },
      { name: 'sourceDbRegex', type: String },
      { name: 'targetDb', type: String },
    ];

    const options = commandLineArgs(optionDefinitions);

    if (options.adminUrl === undefined ||
      options.sourceBaseUrl === undefined ||
      options.targetBaseUrl === undefined ||
      options.sourceDbRegex === undefined ||
      options.targetDb === undefined) {
      /* eslint-disable no-console */
      console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
      console.log('Example:');
      console.log(
        'node /vagrant/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl "http://admin:bar@127.0.0.1:5984/" --sourceBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/" --targetBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/"  --sourceDbRegex "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" --targetDb "labeling_api_read_only" [--hotStandByUrl "http://admin:bar@127.0.0.1:5989/]');
      /* eslint-enable no-console */

      process.exit(1);
    }


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
  }

  run() {
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

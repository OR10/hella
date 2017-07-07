const commandLineArgs = require('command-line-args');
let {Replicator} = require('./Jobs/Replicator');
const {Worker} = require('./Worker');
const {Utils} = require('./Utils');

class ReplicationManager {
  constructor() {
    const optionDefinitions = [
      {name: 'adminUrl', type: String},
      {name: 'sourceBaseUrl', type: String},
      {name: 'targetBaseUrl', type: String},
      {name: 'hotStandByUrl', type: String},
      {name: 'sourceDbRegex', type: String},
      {name: 'targetDb', type: String},
    ];

    const options = commandLineArgs(optionDefinitions);

    if (options.adminUrl === undefined ||
      options.sourceBaseUrl === undefined ||
      options.targetBaseUrl === undefined ||
      options.sourceDbRegex === undefined ||
      options.targetDb === undefined) {
      // eslint-disable-next-line
      console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
      console.log('Example:');
      console.log(
        'node /vagrant/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl "http://admin:bar@127.0.0.1:5984/" --sourceBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/" --targetBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/"  --sourceDbRegex "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" --targetDb "labeling_api_read_only" [--hotStandByUrl "http://admin:bar@127.0.0.1:5989/]');
      process.exit(1);
    }


    this.adminUrl = options.adminUrl;
    this.sourceBaseUrl = options.sourceBaseUrl;
    this.targetBaseUrl = options.targetBaseUrl;
    this.sourceDbRegex = options.sourceDbRegex;
    this.targetDb = options.targetDb;
    this.hotStandByUrl = options.hotStandByUrl;
    this.nanoAdmin = require('nano')(this.adminUrl);
    this.worker = new Worker(this.nanoAdmin);

    this.purgeAllPreviousManagedReplicationLeftOvers().then(() => {
      this.addOneTimeReplicationForAllDatabases();
      this.listenToDatabaseChanges();
    });
  }

  listenToDatabaseChanges() {
    console.log('Listen to the changes feed now.');
    const db = this.nanoAdmin.use('_db_updates');
    const feed = db.follow({include_docs: true, since: 'now'});

    feed.on('change', (change) => {
      const updatedDb = change.db_name;
      if (updatedDb.match(this.sourceDbRegex) !== null) {
        this._addWorkerJob(updatedDb, this.targetDb);
      }
    });
    feed.follow();
  }

  addOneTimeReplicationForAllDatabases() {
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
    });
  }

  purgeAllPreviousManagedReplicationLeftOvers() {
    console.log('Purging all possible left overs from previous replication runs');
    return new Promise((resolve, reject) => {
      this.nanoAdmin.db.list((err, body) => {
        if (err) {
          return reject(err);
        }

        body.forEach(databaseName => {
          if (databaseName.match(this.sourceDbRegex) !== null) {
            this._purgeCouchDbReplicationDocument(databaseName, this.targetDb);
          }
        });
        resolve();
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
    if (this.hotStandByUrl !== undefined) {
      const sourceUrl = this.sourceBaseUrl + sourceDatabase;
      const targetUrl = this.hotStandByUrl + sourceDatabase;
      Utils.purgeCouchDbReplicationDocument(this.nanoAdmin, Utils.getReplicationDocumentIdName(sourceUrl, targetUrl));
    }
    const sourceUrl = this.sourceBaseUrl + sourceDatabase;
    const targetUrl = this.hotStandByUrl + targetDatabase;
    Utils.purgeCouchDbReplicationDocument(this.nanoAdmin, Utils.getReplicationDocumentIdName(sourceUrl, targetUrl));
  }

  /**
   * Add the replication job(s) to the worker
   * @param sourceDatabase
   * @param targetDatabase
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

new ReplicationManager();

const {getReplicationDocumentIdName} = require('../Utils');
const uuid = require('uuid');

class Replicator {
  /**
   * @param {Logger} logger
   * @param {nano} nanoAdmin
   * @param {PurgeService} purgeService
   * @param {string} sourceBaseUrl
   * @param {string} sourceDatabase
   * @param {string} targetUrl
   */
  constructor(logger, nanoAdmin, purgeService, sourceBaseUrl, sourceDatabase, targetUrl) {
    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {nano}
     */
    this.nanoAdmin = nanoAdmin;

    /**
     * @type {PurgeService}
     * @private
     */
    this._purgeService = purgeService;

    /**
     * @type {string}
     */
    this.sourceBaseUrl = sourceBaseUrl.replace(/\/*$/g, '');

    /**
     * @type {string}
     */
    this.sourceDatabase = sourceDatabase;

    /**
     * @type {string}
     */
    this.sourceUrl = `${this.sourceBaseUrl}/${this.sourceDatabase}`;

    /**
     * @type {string}
     */
    this.targetUrl = targetUrl;

    /**
     * @type {string}
     */
    this.id = getReplicationDocumentIdName(this.sourceUrl, this.targetUrl);

    /**
     * @type {number}
     * @private
     */
    this._retryCount = 0;

    this._resolve = undefined;
    this._reject = undefined;
  }

  run() {
    const replicatorDb = this.nanoAdmin.use('_replicator');
    const replicationDocument = {
      worker_batch_size: 50,
      source: this.sourceUrl,
      target: this.targetUrl,
      continuous: false,
      create_target: true,
    };

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    Promise.resolve()
      .then(() => this._checkForDatabaseExistence(this.sourceDatabase))
      .then(databaseExists => {
        if (!databaseExists) {
          // Database is gone. Therefore no replication necessary
          this._resolve();
          return;
        }

        return this._insertReplicationDbEntry(replicatorDb, replicationDocument);
      })
      .catch(error => this._reject(error));

    return this.promise;
  }

  /**
   * Insert a replication document into the database.
   *
   * @param {nano.db} replicatorDb
   * @param {object} replicationDocument
   * @returns {Promise}
   * @private
   */
  _insertReplicationDbEntry(replicatorDb, replicationDocument) {
    return new Promise((resolve, reject) => {
      replicatorDb.insert(
        replicationDocument,
        this.id,
        error => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      )
    });
  }

  /**
   * Check for the existence of an arbitrary database in the source couchdb
   *
   * The returned promise always resolves with true/false.
   *
   * @param {string} databaseName
   * @returns {Promise.<boolean>}
   * @private
   */
  _checkForDatabaseExistence(databaseName) {
    return new Promise(resolve => {
      this.nanoAdmin.db.get(databaseName, (error, body) => resolve(!error));
    });
  }

  onChangeOccurred(change) {
    if (this._resolve === undefined || this._reject === undefined) {
      return;
    }
    if (change.doc._id === this.id) {
      if (change.doc._replication_state === 'completed' || change.doc._replication_state === 'error') {
        this._purgeService.purgeDocument(
          '_replicator',
          change.doc._id
        )
          .then(() => {
            if (change.doc._replication_state === 'completed') {
              this._resolve();
            } else {
              this._reject('Replication rejected');
            }
          })
          .catch(err => {
            this._reject(err);
          });
      }
    }
  }

  /**
   * @returns {number}
   */
  get retryCount() {
    return this._retryCount;
  }

  /**
   * @returns {void}
   */
  incrementRetryCount() {
    this._retryCount += 1;
  }

  /**
   * @returns {boolean}
   */
  hasReachedMaximumRetries() {
    return this._retryCount > 5;
  }

  toJSON() {
    return {
      id: this.id,
      sourceBaseUrl: this.sourceBaseUrl,
      sourceDatabase: this.sourceDatabase,
      sourceUrl: this.sourceUrl,
      targetUrl: this.targetUrl,
      retryCount: this._retryCount,
      resolveIsDefined: this._resolve !== undefined,
      rejectIsDefined: this._reject !== undefined,
    }
  }
}

exports.Replicator = Replicator;

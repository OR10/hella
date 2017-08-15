const {getReplicationDocumentIdName, destroyAndPurgeDocument} = require('../Utils');
const uuid = require('uuid');

class Replicator {
  constructor(nanoAdmin, sourceUrl, targetUrl) {
    this.nanoAdmin = nanoAdmin;
    this.id = getReplicationDocumentIdName(sourceUrl, targetUrl);
    this.sourceUrl = sourceUrl;
    this.targetUrl = targetUrl;

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
      // Working against a couchdb bug, which disallows the reinsertion of a before deleted document with the exact
      // same content. This should most likely not happen anyways, as we purge documents after they are not needed
      // anymore, but there might be circumstances, where the couchdb does not allow us to purge. This random uuid
      // ensures no replications are stalled for ever.
      random_replication_id_to_work_against_couchdb_bug: uuid.v4(),
    };

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      replicatorDb.insert(
        replicationDocument,
        this.id,
        err => {
          if (err) {
            reject(err);

            return false;
          }
          return true;
        },
      );
    });

    return this.promise;
  }

  onChangeOccurred(change) {
    if (this._resolve === undefined || this._reject === undefined) {
      return;
    }
    const replicatorDb = this.nanoAdmin.use('_replicator');
    if (change.doc._id === this.id) {
      if (change.doc._replication_state === 'completed' || change.doc._replication_state === 'error') {
        destroyAndPurgeDocument(
          this.nanoAdmin,
          replicatorDb,
          change.doc._id,
          change.doc._rev,
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
}

exports.Replicator = Replicator;

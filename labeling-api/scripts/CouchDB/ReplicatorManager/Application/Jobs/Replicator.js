const { getReplicationDocumentIdName, destroyAndPurgeDocument } = require('../Utils');

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

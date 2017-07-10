const { getReplicationDocumentIdName, destroyAndPurgeDocument } = require('../Utils');

class Replicator {
  constructor(nanoAdmin, sourceUrl, targetUrl) {
    this.nanoAdmin = nanoAdmin;
    this.id = getReplicationDocumentIdName(sourceUrl, targetUrl);
    this.sourceUrl = sourceUrl;
    this.targetUrl = targetUrl;

    this.resolve = undefined;
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
      this.resolve = resolve;
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
    const replicatorDb = this.nanoAdmin.use('_replicator');
    if (change.doc._id === this.id && change.doc._replication_state === 'completed') {
      destroyAndPurgeDocument(
        this.nanoAdmin,
        replicatorDb,
        change.doc._id,
        change.doc._rev,
      ).then(() => {
        if (this.resolve !== undefined) {
          this.resolve();
        }
      });
    }
  }
}

exports.Replicator = Replicator;

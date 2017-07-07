const {Utils} = require('../Utils');

class Replicator {
  constructor(nanoAdmin, sourceUrl, targetUrl) {
    this.nanoAdmin = nanoAdmin
    this.id = Utils.getReplicationDocumentIdName(sourceUrl, targetUrl);
    this.sourceUrl = sourceUrl;
    this.targetUrl = targetUrl;
  }

  run() {
    const replicatorDb = this.nanoAdmin.use('_replicator');
    const replicationDocument = {
      'worker_batch_size': 50,
      'source': this.sourceUrl,
      'target': this.targetUrl,
      'continuous': false,
      'create_target': true,
    };

    return new Promise((resolve, reject) => {
      replicatorDb.insert(
        replicationDocument,
        this.id,
        err => {
          if (err) {
            reject(err);
          }

          resolve();
        }
      );
    });
  }
}

exports.Replicator = Replicator;
const md5 = require('md5');

class Utils {
  static destroyAndPurgeDocument(nanoAdmin, db, documentId, revision) {
    return new Promise((resolve, reject) => {
      db.get(documentId, { revs_info: true }, (err, body) => {
        if (err) {
          reject(err);
        }

        const revisions = body._revs_info.map(revInfo => revInfo.rev).reverse();

        db.destroy(documentId, revision, destroyError => {
          if (destroyError) {
            reject(destroyError);
          }

          revisions.push(body._rev);

          Utils._purgeDocument(nanoAdmin, db, documentId, revisions).then(() => {
            resolve();
          }).catch(error => {
            reject(error);
          });
        });
      });
    });
  }

  static purgeCouchDbReplicationDocument(nanoAdmin, documentId) {
    const db = nanoAdmin.use('_replicator');
    return new Promise((resolve, reject) => {
      db.get(documentId, { revs: true, open_revs: 'all' }, (err, results) => {
        if (err) {
          return reject(err);
        }

        // There should only be one or none ok result
        const okResult = results.find(result => ('ok' in result));

        if (okResult === undefined) {
          resolve();
          return true;
        } else if (okResult.ok._deleted === true) {
          const revisions = okResult.ok._revisions.ids.map((hash, index) => `${okResult.ok._revisions.ids.length - index}-${hash}`);
          return Utils._purgeDocument(nanoAdmin, db, documentId, revisions).then(() => {
            resolve();
          }).catch(error => {
            reject(error);
          });
        // eslint-disable-next-line no-else-return
        } else {
          return Utils.destroyAndPurgeDocument(
            nanoAdmin,
            db,
            documentId,
            okResult.ok._rev,
          ).then(() => {
            resolve();
          }).catch(destroyAndPurgeError => {
            // eslint-disable-next-line no-console
            console.log(destroyAndPurgeError);
          });
        }
      });
    });
  }

  static _purgeDocument(nanoAdmin, db, documentId, revisions) {
    const purgeBody = {};
    purgeBody[documentId] = revisions;
    return new Promise((resolve, reject) => {
      nanoAdmin.request({
        db: db.config.db,
        method: 'post',
        path: '_purge',
        body: purgeBody,
      }, err => {
        if (err) {
          reject(err);
          return err;
        }

        resolve();
        return true;
      });
    });
  }

  /**
   *
   * @param {string} source
   * @param {string} target
   * @returns {string}
   */
  static getReplicationDocumentIdName(source, target) {
    return `replication-manager-${md5(source + target)}`;
  }

  static compactReplicationDatabase(nanoAdmin) {
    // eslint-disable-next-line no-console
    console.log('Starting _replicator compaction');
    nanoAdmin.db.compact('_replicator');
  }
}

exports.Utils = Utils;

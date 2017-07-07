const md5 = require('md5');

class Utils {
  static destroyAndPurgeDocument(nanoAdmin, db, documentId, revision, callback) {
    db.get(documentId, { revs_info: true }, (err, body) => {
      if (err) {
        return callback(err);
      }

      const revisions = body._revs_info.map(revInfo => revInfo.rev).reverse();

      db.destroy(documentId, revision, destroyError => {
        if (destroyError) {
          return callback(destroyError);
        }

        revisions.push(body.rev);

        Utils._purgeDocument(nanoAdmin, db, documentId, revisions, callback);

        return true;
      });

      return true;
    });
  }

  static purgeCouchDbReplicationDocument(nanoAdmin, documentId) {
    const db = nanoAdmin.use('_replicator');
    db.get(documentId, { revs: true, open_revs: 'all' }, (err, results) => {
      if (err) {
        return err;
      }

      // There should only be one or none ok result
      const okResult = results.find(result => ('ok' in result));

      if (okResult === undefined) {
        return false;
      } else if (okResult.ok._deleted === true) {
        const revisions = okResult.ok._revisions.ids.map((hash, index) => `${okResult.ok._revisions.ids.length - index}-${hash}`);

        return Utils._purgeDocument(nanoAdmin, db, documentId, revisions, purgeDocumentError => {
          if (purgeDocumentError) {
            return purgeDocumentError;
          }

          return true;
        });
      }
      return Utils.destroyAndPurgeDocument(
        nanoAdmin,
        db,
        documentId,
        okResult.ok._rev,
        destroyAndPurgeDocumentError => {
          if (destroyAndPurgeDocumentError) {
            return destroyAndPurgeDocumentError;
          }

          return true;
        });
    });
  }

  static _purgeDocument(nanoAdmin, db, documentId, revisions, next) {
    const purgeBody = {};
    purgeBody[documentId] = revisions;
    nanoAdmin.request({
      db: db.config.db,
      method: 'post',
      path: '_purge',
      body: purgeBody,
    }, next);
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

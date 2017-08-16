const md5 = require('md5');

function _purgeDocument(nanoAdmin, db, documentId, revisions) {
  const purgeBody = {};
  purgeBody[documentId] = revisions;
  return new Promise((resolve, reject) => {
    nanoAdmin.request({
      db: db.config.db,
      method: 'post',
      path: '_purge',
      body: purgeBody,
    }, (err, body) => {
      if (err) {
        reject(err);
        return err;
      }
      if (Object.keys(body.purged).length === 0) {
        reject('No revisions purged');
        return false;
      }

      resolve();
      return true;
    });
  });
}

/**
 * Destroy and purge the replication document
 *
 * @param nanoAdmin
 * @param db
 * @param documentId
 * @param revision
 * @returns {Promise}
 */
function _destroyAndPurgeDocument(nanoAdmin, db, documentId, revision) {
  return new Promise((resolve, reject) => {
    db.get(documentId, { revs_info: true }, (err, body) => {
      if (err) {
        reject(err);
        return;
      }

      const revisions = body._revs_info.map(revInfo => revInfo.rev).reverse();

      db.destroy(documentId, revision, (destroyError, destroyBody) => {
        if (destroyError) {
          reject(destroyError);
          return;
        }

        revisions.push(destroyBody.rev);

        _purgeDocument(nanoAdmin, db, documentId, revisions).then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    });
  });
}

function purgeCouchDbReplicationDocument(nanoAdmin, documentId, logger) {
  const db = nanoAdmin.use('_replicator');
  return new Promise((resolve, reject) => {
    db.get(documentId, { revs: true, open_revs: 'all' }, (err, results) => {
      if (err) {
        return reject(err);
      }

      // There should only be one or none ok result
      const okResults = results.filter(candidate => ('ok' in candidate));

      if (okResults.length === 0) {
        resolve();
        return true;
      }

      // first purge when document is already deleted then delete and purge the rest
      okResults.forEach(okResult => {
        if (!okResult.ok._deleted) {
          return;
        }

        const revisions = okResult.ok._revisions.ids.map(
          (hash, index) => `${okResult.ok._revisions.ids.length - index}-${hash}`
        );
        return _purgeDocument(nanoAdmin, db, documentId, revisions).then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });
      });

      okResults.forEach(okResult => {
        if (okResult.ok._deleted) {
          return;
        }

        return _destroyAndPurgeDocument(
          nanoAdmin,
          db,
          documentId,
          okResult.ok._rev,
        ).then(() => {
          resolve();
        }).catch(destroyAndPurgeError => {
          logger.logString(destroyAndPurgeError);
        });
      });
    });
  });
}

/**
 *
 * @param {string} source
 * @param {string} target
 * @returns {string}
 */
function getReplicationDocumentIdName(source, target) {
  return `replication-manager-${md5(source + target)}`;
}

exports.purgeCouchDbReplicationDocument = purgeCouchDbReplicationDocument;
exports.getReplicationDocumentIdName = getReplicationDocumentIdName;

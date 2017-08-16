class PurgeService {
  /**
   * @param {Logger} logger
   * @param {nano} nanoAdmin
   */
  constructor(logger, nanoAdmin) {
    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {nano}
     * @private
     */
    this._nanoAdmin = nanoAdmin;
  }

  /**
   * Purge a document completely from the database
   *
   * The document may either still exist, or already be deleted.
   * The purging implementation will take care of all necessary steps to completely erase the document from
   * existence.
   *
   * @param {string} databaseName
   * @param {string} documentId
   * @returns {Promise}
   */
  purgeDocument(databaseName, documentId) {
    const db = this._nanoAdmin.use(databaseName);

    return new Promise((resolve, reject) => {
      db.get(documentId, {revs: true, open_revs: 'all'}, (err, results) => {
        if (err) {
          return reject(err);
        }

        /*
         * Even though the documentation states otherwise, we may have multiple results for the same document
         * with different revision tree. I have no idea how this could happen, but it happened at least once
         * for us in production.
         */
        const okResults = results.filter(candidate => ('ok' in candidate));

        // Nothing to purge!
        if (okResults.length === 0) {
          return resolve();
        }

        const toBeDeletedAndPurged = okResults.filter(candidate => !candidate.ok._deleted);
        const toBePurged = okResults.filter(candidate => candidate.ok._deleted);

        toBePurged.forEach(result => {
          const revisions = result.ok._revisions.ids.map(
            (hash, index) => `${result.ok._revisions.ids.length - index}-${hash}`
          );

          return this._purgeDocument(db, documentId, revisions)
            .then(() => resolve())
            .catch(error => reject(error));
        });

        toBeDeletedAndPurged.forEach(result => {
          return this._destroyAndPurgeDocument(
            db,
            documentId,
            result.ok._rev,
          )
            .then(() => resolve())
            .catch(destroyAndPurgeError => reject(destroyAndPurgeError));
        });
      });
    });
  }

  _destroyAndPurgeDocument(db, documentId, revision) {
    return new Promise((resolve, reject) => {
      db.get(documentId, {revs_info: true}, (err, body) => {
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

          this._purgeDocument(db, documentId, revisions)
            .then(() => resolve())
            .catch(error => reject(error));
        });
      });
    });
  }

  _purgeDocument(db, documentId, revisions) {
    const purgeBody = {};
    purgeBody[documentId] = revisions;
    return new Promise((resolve, reject) => {
      this._nanoAdmin.request({
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
}

exports.PurgeService = PurgeService;
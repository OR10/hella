const {clone} = require('lodash');

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

    return Promise.resolve()
      .then(() => this._fetchAllLeafRevisionsOfDocument(db, documentId))
      .then(leafs => {
        const toBePurged = leafs.filter(candidate => candidate.deleted);
        const toBeDeletedAndPurged = leafs.filter(candidate => !candidate.deleted);

        // Sequentially purge the given leafs
        const purgePromise = toBePurged.reduce(
          (carry, leaf) => carry.then(() => this._purgeLeaf(leaf)),
          Promise.resolve()
        );

        // After purging already deleted leafs sequentially delete and purge all others
        const deleteAndPurgePromise = toBeDeletedAndPurged.reduce(
          (carry, leaf) => carry.then(() => {
            return Promise.resolve()
              .then(() => this._deleteLeaf(leaf))
              .then(updatedLeaf => this._purgeLeaf(updatedLeaf));
          }),
          purgePromise
        );

        return deleteAndPurgePromise;
      })
      .then(() => this._logger.logString(`Purged document: ${databaseName}/${documentId}`));
  }

  /**
   * Fetch all leaf revisions of an arbitrary document (deleted or still in existence)
   *
   * Revisions are provided from the most current down to the first one. (5-abcdef, 4-abcdef, ...)
   *
   * @param {nano.db} db
   * @param {string} documentId
   * @returns {Promise.<Array.<{db: nano.db, id: string, deleted: boolean, revisions: Array.<string>}>>}
   * @private
   */
  _fetchAllLeafRevisionsOfDocument(db, documentId) {
    return new Promise((resolve, reject) => {
      db.get(documentId, {revs: true, open_revs: 'all'}, (error, results) => {
        if (error) {
          return reject(error);
        }

        /*
         * Even though the documentation states otherwise, we may have multiple results for the same document
         * with different revision tree. I have no idea how this could happen, but it happened at least once
         * for us in production.
         */
        const okResults = results.filter(candidate => ('ok' in candidate));

        // Document does not exist in the database
        if (okResults.length === 0) {
          return resolve([]);
        }

        const formattedResults = okResults.map(okResult => {
          // Revisions in the response don't have a revision number
          // Therefore we are adding it again.
          const revisions = okResult.ok._revisions.ids.map(
            (hash, index) => `${okResult.ok._revisions.ids.length - index}-${hash}`
          );

          return {
            id: documentId,
            deleted: !!okResult.ok._deleted,
            revisions,
            db,
          }
        });

        resolve(formattedResults);
      });
    });
  }

  /**
   * Delete a leaf from the database, returning an updated version of the leaf, including the latest (deleted) revision
   *
   * The returned updated leaf can directly used to purge the document completely.
   *
   * @param {{id: string, db: nano.db, deleted: boolean, revisions: Array.<string>}} leaf
   * @returns {Promise}
   * @private
   */
  _deleteLeaf(leaf) {
    const {db, id, revisions: [latestRevision]} = leaf;

    return new Promise((resolve, reject) => {
      db.destroy(
        id,
        latestRevision,
        (error, body) => {

          if (error) {
            return reject(error);
          }

          const updatedLeaf = this._cloneLeaf(leaf);
          updatedLeaf.revisions.unshift(body.rev);

          return resolve(updatedLeaf);
        }
      );
    });
  }

  /**
   * @param {{id: string, db: nano.db, deleted: boolean, revisions: Array.<string>}} leaf
   * @returns {Promise}
   * @private
   */
  _purgeLeaf(leaf) {
    const {id, revisions, db} = leaf;

    const purgeRequestBody = {
      [id]: revisions
    };

    return new Promise((resolve, reject) => {
      this._nanoAdmin.request(
        {
          db: db.config.db,
          method: 'post',
          path: '_purge',
          body: purgeRequestBody,
        },
        (error, body) => {
          if (error) {
            return reject(error);
          }

          if (Object.keys(body.purged).length === 0) {
            return reject(
              'None of the given leaf revisions could be purged. Are you sure the latest revision was included in the list?');
          }

          return resolve();
        }
      );
    });
  }


  /**
   * Clone a leaf
   *
   * @param {{id: string, db: nano.db, deleted: boolean, revisions: Array.<string>}} leaf
   * @returns {{id: string, db: nano.db, deleted: boolean, revisions: Array.<string>}}
   * @private
   */
  _cloneLeaf(leaf) {
    return {
      db: leaf.db,
      id: leaf.id,
      revisions: clone(leaf.revisions),
      deleted: leaf.deleted,
    };
  }
}

exports.PurgeService = PurgeService;
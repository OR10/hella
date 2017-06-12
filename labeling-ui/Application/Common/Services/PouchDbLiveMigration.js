class PouchDbLiveMigration {
  /**
   * @param {Array.<PouchDbMigration>} migrations
   */
  constructor(...migrations) {
    /**
     * @type {Array.<PouchDbMigration>}
     * @private
     */
    this._migrations = migrations;

    /**
     * Number of registered migrations stored for perfomance reasons.
     *
     * @type {Number}
     * @private
     */
    this._migrationsCount = this._migrations.length;
  }

  /**
   * Install available migrations with the `transform-pouch` plugin for processing on the given pouchdb instance
   * @param {PouchDB} db
   */
  install(db) {
    db.transform({
      outgoing: doc => this._transformOutgoing(doc),
    });
  }

  /**
   * @param {Object} doc
   * @return {Object}
   * @private
   */
  _transformOutgoing(doc) {
    // Skip design documents
    if (doc._id && doc._id.indexOf('_design/') === 0) {
      return doc;
    }

    for (let index = 0; index < this._migrationsCount; ++index) {
      const migration = this._migrations[index];
      if (!migration.supportsDocument(doc)) {
        continue;
      }

      migration.migrateDocument(doc);
    }

    return doc;
  }
}

PouchDbLiveMigration.$inject = [
  // 'exampleMigration' // See ExampleMigration for a simple example of a migration
];

export default PouchDbLiveMigration;

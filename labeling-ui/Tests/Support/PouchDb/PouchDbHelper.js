import PouchDB from 'pouchdb';
import uuid from 'uuid';

class PouchDbHelper {
  constructor() {
    /**
     * @type {PouchDB|null}
     */
    this.database = null;

    /**
     * @type {string|null}
     * @private
     */
    this._databaseName = null;
  }

  /**
   * Initialize the Helper
   *
   * This method should be called in a `beforeEach` function of the test suite
   *
   * The operation may be asynchronous there a promise is returned. Use the `done` callback of the `beforeEach` function
   * in order to handle this properly.
   *
   * @return {Promise}
   */
  initialize() {
    this._databaseName = this._generateDatabaseName();
    this.database = new PouchDB(this._databaseName);

    // Operations may be asyncronous in the future.
    return Promise.resolve();
  }

  /**
   * Destroy the Helper
   *
   * This method needs be called in a `afterEach` function of the test suite
   *
   * The `afterEach` should be on the same level as the `beforeEach` where {@link PouchDbHelper#initialize} is called
   *
   * The operation may be asynchronous there a promise is returned. Use the `done` callback of the `afterEach` function
   * in order to handle this properly.
   *
   * @return {Promise}
   */
  destroy() {
    if (this.database !== null) {
      return this.database.destroy();
    }

    return Promise.resolve();
  }

  /**
   * Generate a random database name for the used testdb
   *
   * @returns {string}
   * @private
   */
  _generateDatabaseName() {
    return `__annostation_unit_test__${uuid.v4()}`;
  }
}
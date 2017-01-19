/**
 * Service to provide preconfigured PouchDB contexts
 */
class PouchDbContextService {
  /**
   * @param {Object} configuration injected
   * @param {PouchDB} PouchDB injected
   */
  constructor(configuration, PouchDB) {
    /**
     * @type {Object}
     */
    this.configuration = configuration;

    /**
     * @type {PouchDB}
     * @private
     */
    this._PouchDB = PouchDB;

    // @TODO: Check if this could be a Map instead of an object.
    /**
     * @type {Object}
     * @private
     */
    this._contextCache = {};
  }

  /**
   * @param {string} taskId
   * @returns {PouchDB} configuredContext might be null of taskId parameter is not of type string
   */
  provideContextForTaskId(taskId) {
    let configuredContext = null;

    if (typeof taskId === 'string') {
      const taskDbName = this.generateStoreIdentifierForTaskId(taskId);
      configuredContext = this._contextCache[taskId];

      if (configuredContext === undefined) {
        configuredContext = new this._PouchDB(taskDbName);
        this._contextCache[taskId] = configuredContext;
      }
    }

    return configuredContext;
  }

  /**
   * Generates unique technical store identifier.
   *
   * @param {string} taskId
   * @returns {string}
   */
  generateStoreIdentifierForTaskId(taskId) {
    if (this.configuration.Common.storage === undefined || this.configuration.Common.storage.local === undefined) {
      throw new Error('No couchdb configuration found in Common/config.json.');
    }

    const localConfig = this.configuration.Common.storage.local;
    const localDatabaseName = localConfig.databaseName;

    if (typeof taskId !== 'string') {
      throw new Error('Given taskId is not a string');
    }

    return `${taskId}-${localDatabaseName}`;
  }

  /**
   * @param {PouchDB} context
   * @return {string} taskId
   */
  queryTaskIdForContext(context) {
    let taskId = null;

    for (const key in this._contextCache) {
      if (context === this._contextCache[key]) {
        taskId = key;
        break;
      }
    }

    return taskId;
  }
}

PouchDbContextService.$inject = ['applicationConfig', 'PouchDB'];

export default PouchDbContextService;

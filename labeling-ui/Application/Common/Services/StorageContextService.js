/**
 * Service to provide preconfigured PouchDB contexts
 */
class StorageContextService {
  /**
   * @param {Object} configuration injected
   * @param {PouchDB} PouchDB injected
   */
  constructor(configuration, PouchDB) {
    this.configuration = configuration;
    this.PouchDB = PouchDB;
    this._contextCache = {};

    const localConfig = this.configuration.Common.storage.local;
    this.localDatabaseName = localConfig.databaseName;
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
        configuredContext = new this.PouchDB(taskDbName);
        this._contextCache[taskId] = configuredContext;
      }
    }

    return configuredContext;
  }

  /**
   * Generates unique technical store identifier.
   * @param {string} taskId
   * @returns {string}
   */
  generateStoreIdentifierForTaskId(taskId) {
    let identifier = null;

    if (typeof taskId === 'string') {
      identifier = `${taskId}-${this.localDatabaseName}`;
    }

    return identifier;
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

StorageContextService.$inject = ['applicationConfig', 'PouchDB'];

export default StorageContextService;

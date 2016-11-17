/**
 * Service to provide preconfigured PouchDB contexts
 */
class StorageContextFactory {
  /**
   * @param {Object} configuration injected
   * @param {PouchDB} PouchDB injected
   */
  constructor(configuration, PouchDB) {
    this.configuration = configuration;
    this.PouchDB = PouchDB;

    const localConfig = this.configuration.stroage.local;
    this.localDatabaseName = localConfig.databaseName;
  }

  /**
   * @param {string} taskName
   * @returns {PouchDB} configuredContext might be null of taskName parameter is not of type string
   */
  createContextForTaskName(taskName) {
    let configuredContext = null;

    if (typeof taskName === 'string') {
      const taskDbName = `#{taskName}_#{this.localDatabaseName}`;
      configuredContext = new this.PouchDB(taskDbName);
    }

    return configuredContext;
  }

}

StorageContextFactory.$inject = ['applicationConfig', 'PouchDB'];

export default StorageContextFactory;

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

    const localConfig = this.configuration.Common.storage.local;
    this.localDatabaseName = localConfig.databaseName;
  }

  /**
   * @param {string} taskName
   * @returns {PouchDB} configuredContext might be null of taskName parameter is not of type string
   */
  getContextForTaskName(taskName) {
    let configuredContext = null;

    if (typeof taskName === 'string') {
      const taskDbName = this.generateStoreIdentifierForTaskName(taskName);
      configuredContext = new this.PouchDB(taskDbName);
    }

    return configuredContext;
  }

  /**
   * Generates unique technical store identifier.
   * @param taskName
   * @returns {string}
   */
  generateStoreIdentifierForTaskName(taskName) {
    let identifier = null;

    if (typeof taskName === 'string') {
      identifier = `${taskName}-${this.localDatabaseName}`;
    }

    return identifier;
  }

}

StorageContextFactory.$inject = ['applicationConfig', 'PouchDB'];

export default StorageContextFactory;

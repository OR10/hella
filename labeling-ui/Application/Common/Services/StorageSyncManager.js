
/**
 * Service to configure and manage syncrhonization related subjects.
 */
class StorageSyncManager {

  /**
   * @param {Object} configuration injected
   */
  constructor(configuration, storageContextService, pouchDb) {
    this._configuration = configuration;
    this._storageContextService = storageContextService;
    this._remoteConfig = this._configuration.Common.storage.remote;
    this._syncHandlerCache = new WeakMap();
    this._pouchDb = pouchDb;
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  startReplicationForContext(context, pausedEventHandler) {
    const taskId = this._storageContextService.queryTaskIdForContext(context);

    if (typeof context !== 'object' || typeof pausedEventHandler !== 'function' || taskId === null) {
      return null;
    }

    let syncHandler = this._syncHandlerCache.get(context);
    if (syncHandler === undefined) {
      const syncSettings = {
        filter: this._remoteConfig.filter,
        query_params: {
          taskId: taskId,
        },
      }
      const replicationEndpointUrl = `${this._remoteConfig.baseUrl}/${this._remoteConfig.databaseName}`;

      syncHandler = this._pouchDb.sync(taskId, replicationEndpointUrl, syncSettings);
      syncHandler.on('paused', pausedEventHandler);
      this._syncHandlerCache.set(context, syncHandler);
    }

    return context;
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  stopReplicationForContext(context) {
    const syncHandler = this._syncHandlerCache.get(context);

    if (typeof context !== 'object' || syncHandler === undefined) {
      return null;
    }

    syncHandler.cancel();

    return context;
  }
}

StorageSyncManager.$inject = ['applicationConfig', 'StorageContextService', 'PouchDB'];

export default StorageSyncManager;

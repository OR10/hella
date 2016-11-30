
/**
 * Service to configure and manage syncrhonization related subjects.
 */
class PouchDbSyncManager {

  /**
   * @param {Object} configuration injected
   */
  constructor(configuration, pouchDbContextService, pouchDb) {
    this._configuration = configuration;
    this._pouchDbContextService = pouchDbContextService;
    this._remoteConfig = this._configuration.Common.storage.remote;
    this._syncHandlerCache = new WeakMap();
    this._pouchDb = pouchDb;
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  startContinousReplicationForContext(context, pausedEventHandler) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);
    const noValidParameters = typeof context !== 'object' || typeof pausedEventHandler !== 'function' || taskId === null;

    if (noValidParameters) {
      return null;
    }

    let syncHandler = this._syncHandlerCache.get(context);
    if (syncHandler === undefined) {
      const syncSettings = {
        filter: this._remoteConfig.filter,
        query_params: {
          taskId: taskId,
        },
      };
      const replicationEndpointUrl = `${this._remoteConfig.baseUrl}/${this._remoteConfig.databaseName}`;

      syncHandler = this._pouchDb.sync(taskId, replicationEndpointUrl, syncSettings);
      syncHandler
        .on('paused', pausedEventHandler)
        .on('complete', () => {
          this._removeContextFromCache(context);
        });

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

  /**
   * @params {PouchDB} context to check sync state on
   * @returns {boolean}
   */
  isReplicationOnContextEnabled(context) {
    return this._syncHandlerCache.has(context);
  }

  /**
   * @param {PouchDB} context
   * @returns {boolean}
   * @private
   */
  _removeContextFromCache(context) {
    this._syncHandlerCache.delete(context);
    return this.isReplicationOnContextEnabled();
  }

  pullUpdatesForContext(context, onCompleteCallback) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    if (typeof context !== 'object' || typeof onCompleteCallback !== 'function' || taskId === null) {
      return null;
    }

    let syncHandler = this._syncHandlerCache.get(context);
    if (syncHandler === undefined) {
      const syncSettings = {
        filter: this._remoteConfig.filter,
        query_params: {
          taskId: taskId,
        },
      };
      const replicationEndpointUrl = `${this._remoteConfig.baseUrl}/${this._remoteConfig.databaseName}`;

      syncHandler = context.replicate.from(replicationEndpointUrl, syncSettings);
      syncHandler
        .on('complete', evnt => {
          this._removeContextFromCache(context);
          onCompleteCallback(evnt);
        });

      this._syncHandlerCache.set(context, syncHandler);
    }

    return context;
  }

  pushUpdatesForContext(context, onCompleteCallback, onChangeCallback) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    if (typeof context !== 'object' || typeof onCompleteCallback !== 'function' || taskId === null) {
      return null;
    }

    let syncHandler = this._syncHandlerCache.get(context);
    if (syncHandler === undefined) {
      const syncSettings = {
      };
      const replicationEndpointUrl = `${this._remoteConfig.baseUrl}/${this._remoteConfig.databaseName}`;

      syncHandler = context.replicate.to(replicationEndpointUrl, syncSettings);
      syncHandler
        .on('complete', evnt => {
          this._removeContextFromCache(context);
          onCompleteCallback(evnt);
        })
        .on('change', evnt => {
          if (onChangeCallback) {
            onChangeCallback(evnt);
          }
        });

      this._syncHandlerCache.set(context, syncHandler);
    }

    return context;
  }

  waitForRemoteToConfirm(context, document, millisTillCancelation) {
    let result = null;
    const isValidDocument = document !== null && typeof document === 'object' && typeof document._id === 'string';
    const useTimeoutOption = typeof millisTillCancelation === 'number' && millisTillCancelation > -1;

    if (isValidDocument) {
      const confirmationPromise = new Promise((resolve, reject) => {
        if (useTimeoutOption) {
          setTimeout(() => {
            const error = new Error('Replication timeout has been reached. Could not confirm replication to remote.');
            reject(error);
          }, millisTillCancelation);
        }

        this.pushUpdatesForContext(context, resolve, event => {
          const hasReceivedDocument = event.docs.filter(doc => doc._id === document._id).length > 0;
          if (hasReceivedDocument) {
            resolve(document);
          }
        });
      });

      result = confirmationPromise;
    }

    return result;
  }

}

PouchDbSyncManager.$inject = ['applicationConfig', 'PouchDbContextService', 'PouchDB'];

export default PouchDbSyncManager;

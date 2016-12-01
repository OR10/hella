/**
 * Service to configure and manage syncrhonization related subjects.
 */
class PouchDbSyncManager {

  /**
   * @param {Object} configuration injected
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDB} pouchDb
   */
  constructor(configuration, $q, pouchDbContextService, pouchDb) {
    /**
     * @type {Object}
     * @private
     */
    this._configuration = configuration;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {object}
     * @private
     */
    this._remoteConfig = this._configuration.Common.storage.remote;

    /**
     * @type {Map.<object, Map>}
     * @private
     */
    this._syncHandlerCacheByContext = new Map();

    /**
     * @type {PouchDB}
     * @private
     */
    this._pouchDb = pouchDb;
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  startLiveReplicationForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._remoteConfig.filters.forEach(filter => {
      [
        PouchDbSyncManager.SYNC_DIRECTION_FROM,
        PouchDbSyncManager.SYNC_DIRECTION_TO
      ].forEach(direction => {
        const hasSyncHandler = this._hasSyncHandlerByContextAndFilterAndDirection(context, filter, direction);
        if (!hasSyncHandler) {
          replicationPromises.push(
            this._replicateForContextWithDirectionAndFilterAndTaskId(
              context,
              direction,
              filter,
              taskId,
              true
            )
          );
        }
      });
    });

    return this._$q.all(replicationPromises);
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  stopReplicationsForContext(context) {
    const filtersInContextMap = this._syncHandlerCacheByContext.get(context);
    for (const [filter, directionsInFilterMap] of filtersInContextMap) {
      for (const [direction, syncHandler] of directionsInFilterMap) {
        syncHandler.cancel();
      }
    }

    return context;
  }

  /**
   * @params {PouchDB} context to check sync state on
   * @returns {boolean}
   */
  isAnyReplicationOnContextEnabled(context) {
    return this._syncHandlerCacheByContext.has(context);
  }

  /**
   * @param {PouchDB} context
   * @returns {boolean}
   * @private
   */
  _removeContextFromCache(context) {
    this._syncHandlerCacheByContext.delete(context);
    return this.isReplicationOnContextEnabled();
  }

  pullUpdatesForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._remoteConfig.filters.forEach(filter => {
      const hasSyncHandler = this._hasSyncHandlerByContextAndFilterAndDirection(context, filter, PouchDbSyncManager.SYNC_DIRECTION_FROM);
      if (!hasSyncHandler) {
        replicationPromises.push(
          this._replicateForContextWithDirectionAndFilterAndTaskId(
            context,
            PouchDbSyncManager.SYNC_DIRECTION_FROM,
            filter,
            taskId
          )
        );
      }
    });

    return this._$q.all(replicationPromises);
  }

  /**
   * @param {object} context
   * @param {"to"|"from"} direction
   * @param {string} filter
   * @param {string} taskId
   * @param {boolean?} live
   * @returns {Promise}
   * @private
   */
  _replicateForContextWithDirectionAndFilterAndTaskId(context, direction, filter, taskId, live = false) {
    const syncSettings = {
      filter,
      live,
      query_params: {
        taskId: taskId,
      },
      retry: true,
    };

    const replicationEndpointUrl = `${this._remoteConfig.baseUrl}/${this._remoteConfig.databaseName}`;
    const deferred = this._$q.defer();
    const replicationFunction = context.replicate[direction];
    const syncHandler = replicationFunction(replicationEndpointUrl, syncSettings);

    syncHandler
      .on('complete', event => {
        this._removeSyncHandlerByContextAndFilterAndDirection(context, filter, direction);
        deferred.resolve(event);
      });

    syncHandler
      .on('error', error => {
        this._removeSyncHandlerByContextAndFilterAndDirection(context, filter, direction);
        deferred.reject(error);
      });

    this._setSyncHandlerByContextAndFilterAndDirection(context, filter, direction, syncHandler);

    return deferred.promise;
  }

  pushUpdatesForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._remoteConfig.filters.forEach(filter => {
      const hasSyncHandler = this._hasSyncHandlerByContextAndFilterAndDirection(context, filter, PouchDbSyncManager.SYNC_DIRECTION_TO);
      if (!hasSyncHandler) {
        replicationPromises.push(
          this._replicateForContextWithDirectionAndFilterAndTaskId(
            context,
            PouchDbSyncManager.SYNC_DIRECTION_TO,
            filter,
            taskId
          )
        );
      }
    });

    return this._$q.all(replicationPromises);
  }

  waitForRemoteToConfirm(context, document, millisTillCancelation) {
    let result = null;
    const isValidDocument = document !== null && typeof document === 'object' && typeof document._id === 'string';
    const useTimeoutOption = typeof millisTillCancelation === 'number' && millisTillCancelation > -1;

    if (isValidDocument) {
      const confirmationPromise = new this._$q((resolve, reject) => {
        if (useTimeoutOption) {
          setTimeout(() => {
            const error = new Error('Replication timeout has been reached. Could not confirm replication to remote.');
            reject(error);
          }, millisTillCancelation);
        }

        this.pushUpdatesForContext(context).then(events => {
          events.forEach(event => {
            const hasReceivedDocument = event.docs.filter(doc => doc._id === document._id).length > 0;
            if (hasReceivedDocument) {
              resolve(document);
            }
          });
        });
      });

      result = confirmationPromise;
    }

    return result;
  }

  /**
   * Check if certain context and filter are currently running as a replication
   *
   * @param {object} context
   * @param {string} filter
   * @param {string} direction
   * @returns {boolean}
   * @private
   */
  _hasSyncHandlerByContextAndFilterAndDirection(context, filter, direction) {
    const hasContext = this._syncHandlerCacheByContext.has(context);
    if (!hasContext) {
      return false;
    }

    const filtersInContextMap = this._syncHandlerCacheByContext.get(context);
    const hasFilterInContext = filtersInContextMap.has(filter);

    if (!hasFilterInContext) {
      return false;
    }

    const directionInFilterMap = filtersInContextMap.get(filter);
    const hasDirectionInFilter = directionInFilterMap.has(direction);

    return hasDirectionInFilter;
  }

  /**
   * Remove a sync handler for a replication based on context and filter
   *
   * The return value indicates if the syncHandler could be located or if none existed in the first place.
   *
   * @param {object} context
   * @param {string} filter
   * @param {string} direction
   * @returns {boolean}
   * @private
   */
  _removeSyncHandlerByContextAndFilterAndDirection(context, filter, direction) {
    const filtersInContextMap = this._syncHandlerCacheByContext.get(context);
    if (filtersInContextMap === undefined) {
      return false;
    }

    const directionsInFilterMap = filtersInContextMap.get(filter);

    if (directionsInFilterMap === undefined) {
      return false;
    }

    return directionsInFilterMap.delete(direction);
  }

  /**
   * @param {object} context
   * @param {string} filter
   * @param {string} direction
   * @param {object} syncHandler
   * @private
   */
  _setSyncHandlerByContextAndFilterAndDirection(context, filter, direction, syncHandler) {
    let filtersInContextMap = this._syncHandlerCacheByContext.get(context);
    if (filtersInContextMap === undefined) {
      // Initialize new inner map if none was present for the given context before.
      filtersInContextMap = new Map();
      this._syncHandlerCacheByContext.set(context, filtersInContextMap);
    }

    let directionsInFilterMap = filtersInContextMap.get(filter);

    if (directionsInFilterMap === undefined) {
      // Initialize new inner map if none was present for the given filter before.
      directionsInFilterMap = new Map();
      filtersInContextMap.set(filter, directionsInFilterMap);
    }

    directionsInFilterMap.set(direction, syncHandler);
  }
}

PouchDbSyncManager.SYNC_DIRECTION_FROM = 'from';
PouchDbSyncManager.SYNC_DIRECTION_TO = 'to';

PouchDbSyncManager.$inject = [
  'applicationConfig',
  '$q',
  'pouchDbContextService',
  'PouchDB',
];


export default PouchDbSyncManager;

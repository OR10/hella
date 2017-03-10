import DeepMap from '../Helpers/DeepMap';

/**
 * Service to configure and manage syncrhonization related subjects.
 */
class PouchDbSyncManagerFoobar {

  /**
   * @param {Object} configuration injected
   * @param {LoggerService} loggerService
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDB} pouchDb
   */
  constructor(configuration, loggerService, $q, pouchDbContextService, pouchDb) {
    /**
     * @type {Object}
     * @private
     */
    this._storageConfiguration = configuration;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = loggerService;

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
     * The cache is structured with nested Maps in the following way:
     * Context -> Filter(name) -> Direction (FROM/TO) -> {live: bool, syncHandler: Replication object}*
     *
     * @type {DeepMap}
     * @private
     */
    this._syncHandlerCache = new DeepMap();

    /**
     * @type {PouchDB}
     * @private
     */
    this._pouchDb = pouchDb;

    /**
     * @type {object}
     * @private
     */
    this._eventListeners = {};
  }

  /**
   * Get the remote configuration object. The object contains the following information:
   *
   * - baseUrl: Base url to access the remote database
   * - databaseName: database name storing the needed information
   * - filters: array of filter functions to be replicated
   *
   * @private
   * @return {Object}
   */
  _getRemoteConfiguration() {
    if (this._storageConfiguration.Common.storage === undefined || this._storageConfiguration.Common.storage.remote === undefined) {
      throw new Error('No pouchdb remote configuration found in Common/config.json.');
    }

    return this._storageConfiguration.Common.storage.remote;
  }

  /**
   * @param {PouchDB} context instance of a local PouchDB
   */
  startLiveReplicationForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._getRemoteConfiguration().filters.forEach(filter => {
      [
        PouchDbSyncManager.SYNC_DIRECTION_FROM,
        PouchDbSyncManager.SYNC_DIRECTION_TO,
      ].forEach(direction => {
        const hasSyncHandler = this._syncHandlerCache.has(context, filter, direction, true);
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
    if (!this._syncHandlerCache.has(context)) {
      return false;
    }

    for (const [, syncHandler] of DeepMap.iterateMapRecursive(this._syncHandlerCache.get(context))) {
      syncHandler.cancel();
    }

    return context;
  }

  /**
   * @params {PouchDB} context to check sync state on
   * @returns {boolean}
   */
  isAnyReplicationOnContextEnabled(context) {
    return this._syncHandlerCache.has(context);
  }

  /**
   * @param {PouchDB} context
   * @returns {boolean}
   * @private
   */
  _removeContextFromCache(context) {
    this._syncHandlerCache.delete(context);
    return this.isAnyReplicationOnContextEnabled(context);
  }

  pullUpdatesForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._getRemoteConfiguration().filters.forEach(filter => {
      const hasSyncHandler = this._syncHandlerCache.has(context, filter, PouchDbSyncManager.SYNC_DIRECTION_FROM, false);
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

  startDuplexLiveReplication(context) {
    const loggerContext = 'DuplexLiveReplication';
    this._logger.log(loggerContext, 'enter startDuplexLiveReplication');

    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);
    const duplexConfig = [
      PouchDbSyncManager.SYNC_DIRECTION_TO,
      PouchDbSyncManager.SYNC_DIRECTION_FROM,
    ];

    const promises = duplexConfig.map(direction => {
      const isCached = false;
      let promise;

      // @TODO: search cache for existing live replication handlers
      if (isCached) {
        this._logger.log(loggerContext, `live replication for ${taskId} already running`);
        promise = this._$q.resolve();
      } else {
        this._logger.log(loggerContext, `requesting live replication for ${taskId}`);
        promise = this._replicateForContextWithDirectionAndFilterAndTaskId(context, direction, undefined, taskId, true);
      }
      return promise;
    });
    this._logger.log(loggerContext, 'exit startDuplexLiveReplication');

    return this._$q.all(promises);
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

    const replicationEndpointUrl = `${this._getRemoteConfiguration().baseUrl}/${this._getRemoteConfiguration().databaseName}`;
    const deferred = this._$q.defer();
    const replicationFunction = context.replicate[direction];
    const syncHandler = replicationFunction(replicationEndpointUrl, syncSettings);

    if (live) {
      this._startLiveReplicationWithDirectionAndFilter(direction, syncHandler, context, filter, deferred);
    } else {
      syncHandler
        .on('complete', event => {
          this._syncHandlerCache.delete(context, filter, direction, live);
          deferred.resolve(event);
        })
        .on('error', error => {
          this._syncHandlerCache.delete(context, filter, direction, live);
          deferred.reject(error);
        });
    }

    this._syncHandlerCache.set(context, filter, direction, live, syncHandler);

    return deferred.promise;
  }

  /**
   * @param direction
   * @param syncHandler
   * @param context
   * @param filter
   * @param deferred
   * @private
   */
  _startLiveReplicationWithDirectionAndFilter(direction, syncHandler, context, filter, deferred) {
    const translation = ({
      from: 'from_server',
      to: 'to_server',
    })[direction];

    const loggerContext = `LiveReplication:${translation}`;
    syncHandler.on('complete', event => {
      this._logger.log(loggerContext, `[:complete]`, event);
      this._syncHandlerCache.delete(context, filter, direction, true);
    }).on('error', error => {
      this._logger.log(loggerContext, `[:error]`, error);
      this._syncHandlerCache.delete(context, filter, direction, true);
      deferred.reject(error);
      this._emit('offline');
    }).on('change', info => {
      this._logger.log(loggerContext, `[:change]`, info);
      this._emit('transfer');
    }).on('paused', event => {
      this._logger.log(loggerContext, `[:paused]`, event);
      if (event && event.status === 0) {
        this._emit('offline');
      } else {
        this._emit('alive');
      }
      // @TODO: Check if this is correct here!
      deferred.resolve(event);
    }).on('active', event => {
      this._logger.log(loggerContext, `[:active]`, event);
      this._emit('transfer');
      // @TODO: Check if this is correct here!
      deferred.resolve();
    }).on('denied', error => {
      this._logger.log(loggerContext, `[:denied]`, error);
      this._emit('offline');
    });
  }

  pushUpdatesForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);

    const replicationPromises = [];
    this._getRemoteConfiguration().filters.forEach(filter => {
      const hasSyncHandler = this._syncHandlerCache.has(context, filter, PouchDbSyncManager.SYNC_DIRECTION_TO, false);
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

  on(eventName, eventCallback) {
    if (this._eventListeners[eventName] === undefined) {
      this._eventListeners[eventName] = [];
    }
    this._eventListeners[eventName].push(eventCallback);
  }

  _emit(eventName, data = []) {
    if (this._eventListeners[eventName] === undefined) {
      return;
    }

    this._eventListeners[eventName].forEach(fn => fn(...data));
  }
}

PouchDbSyncManagerFoobar.SYNC_DIRECTION_FROM = 'from';
PouchDbSyncManagerFoobar.SYNC_DIRECTION_TO = 'to';

PouchDbSyncManagerFoobar.$inject = [
  'applicationConfig',
  'loggerService',
  '$q',
  'pouchDbContextService',
  'PouchDB',
];

export default PouchDbSyncManagerFoobar;

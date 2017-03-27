import PouchDb from 'pouchdb';

import DeepMap from '../Support/DeepMap';

/**
 * Service to manage synchronizations of PouchDB databases with the correlating backend database
 *
 * Live as, well as one-shot replications are supported, which are one- or bi-directional.
 *
 * Switching between those replication types for "sync-point" purposes is supported as well.
 */
class PouchDbSyncManager {
  /**
   * @param {LoggerService} loggerService
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {TaskGateway} taskGateway
   */
  constructor(loggerService, $q, pouchDbContextService, taskGateway) {
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
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * Cache of remote database information for a specific taskId
     *
     * This cache contains information about where to find the remote id for any given taskId
     *
     * @type {Map}
     * @private
     */
    this._remoteDatabaseInformationCache = new Map();

    /**
     * Cache of the promises associated with currently running replications.
     *
     * @type {DeepMap}
     * @private
     */
    this._replicationPromiseCache = new DeepMap();

    /**
     * Storage for all currently running {@link Replication}s for a specific context
     *
     * @type {Map.<PouchDB, Array.<Replication>>}
     * @private
     */
    this._runningReplicationsByContext = new Map();

    /**
     * Registered EventListeners
     *
     * @type {Map}
     * @private
     */
    this._eventHandlersByEvent = new Map([
      ['offline', []],
      ['alive', []],
      ['transfer', []],
    ]);
  }

  /**
   * Initiate uni-directional one-shot replication for database.
   *
   * The data flow is directed from the backend to the frontend (pull).
   *
   * @param {PouchDB} context
   * @return {Promise.<Event>}
   */
  pullUpdatesForContext(context) {
    if (this._replicationPromiseCache.has(context, 'one-shot', 'pull')) {
      return this._replicationPromiseCache.get(context, 'one-shot', 'pull');
    }

    const promise = this._$q.resolve()
      .then(() => this._getReplicationTargetForContext(context))
      .then(replicationTarget => this._getRemoteDbPullReplication(context, replicationTarget));

    this._removeFromPromiseCacheWhenCompleted(promise, context, 'one-shot', 'pull');

    // We need to store the promise here, before we even start any lookup. Otherwise we might have race
    // condition, between the lookup of the replication target and a second attempt to request "start" the
    // replication.
    this._replicationPromiseCache.set(context, 'one-shot', 'pull', promise);

    return promise;
  }


  /**
   * Initiate uni-directional one-shot replication for database.
   *
   * The data flow is directed from the frontend to the backend (push).
   *
   * @param {PouchDB} context
   * @return {Promise.<Event>}
   */
  pushUpdatesForContext(context) {
    if (this._replicationPromiseCache.has(context, 'one-shot', 'push')) {
      return this._replicationPromiseCache.get(context, 'one-shot', 'push');
    }

    const promise = this._$q.resolve()
      .then(() => this._getReplicationTargetForContext(context))
      .then(replicationTarget => this._getRemoteDbPushReplication(context, replicationTarget));

    this._removeFromPromiseCacheWhenCompleted(promise, context, 'one-shot', 'push');

    // We need to store the promise here, before we even start any lookup. Otherwise we might have race
    // condition, between the lookup of the replication target and a second attempt to request "start" the
    // replication.
    this._replicationPromiseCache.set(context, 'one-shot', 'push', promise);

    return promise;
  }

  /**
   * Start a bi-directional continuous replication for the given context
   *
   * The returned promise is resolved once both directions (push, pull) of the live replication have ended.
   * Alternatively it is rejected if any of the replications fail at any point in time.
   *
   * @param {PouchDB} context
   * @return {Promise.<Event>}
   */
  startDuplexLiveReplication(context) {
    if (this._replicationPromiseCache.has(context, 'continuous')) {
      return this._replicationPromiseCache.get(context, 'continuous');
    }

    const promise = this._$q.resolve()
      .then(() => this._getReplicationTargetForContext(context))
      .then(replicationTarget => {
        this._getRemoteDbPullReplication(context, replicationTarget, true);
        this._getRemoteDbPushReplication(context, replicationTarget, true);
      });

    this._removeFromPromiseCacheWhenCompleted(promise, context, 'continuous');

    // We need to store the promise here, before we even start any lookup. Otherwise we might have race
    // condition, between the lookup of the replication target and a second attempt to request "start" the
    // replication.
    this._replicationPromiseCache.set(context, 'continuous', promise);

    return promise;
  }

  /**
   * Stop all currently running replications for the given context
   *
   * A Promise is returned, which is fulfilled. once every replication for the context has ended successfully.
   * The Promise is rejected, should anything go wrong during the abort procedure.
   *
   * @param {PouchDB} context
   * @return {Promise}
   */
  stopReplicationsForContext(context) {
    if (this._runningReplicationsByContext.has(context) === false) {
      // No replication is running for the context, we are already finished.
      return this._$q.resolve();
    }

    const runningReplicationsForContext = this._runningReplicationsByContext.get(context);
    runningReplicationsForContext.forEach(replication => replication.cancel());

    // All PouchDB Replications are promises
    return this._$q.all(runningReplicationsForContext);
  }

  /**
   * Register an Event to be informed about
   *
   * Possible Events are:
   *
   * - offline
   * - alive
   * - transfer
   *
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (this._eventHandlersByEvent.has(eventName) === false) {
      throw new Error(`Unknown event ${eventName} can not be registered.`);
    }

    const eventHandlers = this._eventHandlersByEvent.get(eventName);
    this._eventHandlersByEvent.set(eventName, [...eventHandlers, callback]);
  }

  /**
   * Emit an event with a specific dataset
   *
   * @param {string} eventName
   * @param {Array.<*>?} data
   * @private
   */
  _emit(eventName, data = []) {
    if (this._eventHandlersByEvent.has(eventName) === false) {
      throw new Error(`Unknown event ${eventName} can not be emitted.`);
    }
    this._logger.log('pouchDb:syncManager', `Replication event occurred: "${eventName}"`, data);

    const eventHandlers = this._eventHandlersByEvent.get(eventName);
    eventHandlers.forEach(callback => callback(...data));
  }

  /**
   * Create a sync handler for a unidirectional pull replication
   * Pull meaning: Server => Client
   *
   * @param {PouchDB} context
   * @param {string} replicationTarget
   * @param {boolean} continuous
   * @returns {Replication}
   * @private
   */
  _getRemoteDbPullReplication(context, replicationTarget, continuous = false) {
    const replicationOptions = {
      live: continuous,
      retry: true,
    };
    this._logger.log('pouchDb:syncManager', 'Starting remote pull replication', replicationOptions);

    const remoteDb = this._getRemoteDbForReplicationTarget(replicationTarget);
    const replication = context.replicate.from(remoteDb, replicationOptions);

    this._trackReplicationForContext(replication, context);
    this._registerReplicationEventListeners(replication);

    return replication;
  }

  /**
   * Create a sync handler for a unidirectional push replication
   * Push meaning: Client => Server
   *
   * @param {PouchDB} context
   * @param {string} replicationTarget
   * @param {boolean} continuous
   * @returns {Replication}
   * @private
   */
  _getRemoteDbPushReplication(context, replicationTarget, continuous = false) {
    const replicationOptions = {
      live: continuous,
      retry: true,
    };
    this._logger.log('pouchDb:syncManager', 'Starting remote push replication', replicationOptions);

    const remoteDb = this._getRemoteDbForReplicationTarget(replicationTarget);
    const replication = context.replicate.to(remoteDb, replicationOptions);

    this._trackReplicationForContext(replication, context);
    this._registerReplicationEventListeners(replication);

    return replication;
  }

  /**
   * Create a PouchDB instance
   *
   * @param {string} replicationTarget
   * @return {PouchDb}
   * @private
   */
  _getRemoteDbForReplicationTarget(replicationTarget) {
    return new PouchDb(replicationTarget);
  }

  /**
   * Resolve a replication target (url) for a specific database
   *
   * @param {PouchDb} context
   * @return {Promise.<string>}
   * @private
   */
  _getReplicationTargetForContext(context) {
    const taskId = this._pouchDbContextService.queryTaskIdForContext(context);
    return this._$q.resolve()
      .then(() => this._getReplicationInformationForTaskId(taskId))
      .then(replicationInformation => {
        const replicationTarget = `${replicationInformation.databaseServer}/${replicationInformation.databaseName}`;
        this._logger.log('pouchDb:syncManager', `Got replication target "${replicationTarget}"`);

        return replicationTarget;
      });
  }


  /**
   * @param {string} taskId
   * @return {Promise.<TaskReplicationInformation>}
   * @private
   */
  _getReplicationInformationForTaskId(taskId) {
    let promise = this._$q.resolve();

    if (this._remoteDatabaseInformationCache.has(taskId) === false) {
      promise = promise
        .then(() => this._taskGateway.getTaskReplicationInformationForTaskId(taskId))
        .then(replicationInformation => this._remoteDatabaseInformationCache.set(taskId, replicationInformation));
    }

    promise = promise
      .then(() => this._remoteDatabaseInformationCache.get(taskId));

    return promise;
  }

  /**
   * Remove replication promise from cache once it stopped
   *
   * This is not part of the cached or returned promise chain and therefore does not stop any chaining
   * or error handling on it.
   *
   * @param {Promise} promise
   * @param {Array.<*>} keys storage keys for this promise inside the cache.
   * @private
   */
  _removeFromPromiseCacheWhenCompleted(promise, ...keys) {
    promise
      .then(() => this._replicationPromiseCache.delete(...keys))
      .catch(() => this._replicationPromiseCache.delete(...keys));
  }

  /**
   * Install handlers to track a running PouchDB replication
   *
   * It will be automatically stored in the {@link _runningReplicationsByContext} Map and is removed
   * from it again once it finishes.
   *
   * @param {Replication} replication
   * @param {PouchDB} context
   * @private
   */
  _trackReplicationForContext(replication, context) {
    this._logger.log('pouchDb:syncManager', `Track new running replication for context`, context);
    this._addReplicationToRunningReplications(replication, context);

    replication
      .then(() => {
        this._logger.log('pouchDb:syncManager', `Replication finished, removing from list!`, context);
        this._removeReplicationFromRunningReplications(replication, context);
      })
      .catch(() => {
        this._logger.warn('pouchDb:syncManager', `Replication aborted, removing from list!`, context);
        this._removeReplicationFromRunningReplications(replication, context);
      });
  }

  /**
   * Add the replication provided by the given promise to the {@link _runningReplicationsByContext} Map once
   * it gets available
   *
   * @param {Replication} replication
   * @param {PouchDB} context
   * @private
   */
  _addReplicationToRunningReplications(replication, context) {
    this._logger.groupStart('pouchDb:syncManager', `Add replication to to running replications list`);
    if (this._runningReplicationsByContext.has(context) === false) {
      this._runningReplicationsByContext.set(context, []);
      this._logger.log('pouchDb:syncManager', `Context was not present in list, setting now`, context);
    }

    this._logger.log('pouchDb:syncManager', `Loading replications for context`, context);
    const runningReplicationsByContext = this._runningReplicationsByContext.get(context);
    this._logger.log('pouchDb:syncManager', `Setting replication for context`, replication);
    this._runningReplicationsByContext.set(context, [...runningReplicationsByContext, replication]);
    this._logger.groupEnd('pouchDb:syncManager');
  }

  /**
   * Remove the replication from the {@link _runningReplicationsByContext} Map
   *
   * @param {Replication} replication
   * @param {PouchDB} context
   * @private
   */
  _removeReplicationFromRunningReplications(replication, context) {
    this._logger.groupStart('pouchDb:syncManager', `Remove replication from running replications list`);
    if (this._runningReplicationsByContext.has(context) === false) {
      this._logger.log('pouchDb:syncManager', `Context was not present in list, do nothing!`, context);
      this._logger.groupEnd('pouchDb:syncManager');
      return;
    }

    this._logger.log('pouchDb:syncManager', `Loading replications for context`, context);
    const runningReplicationsByContext = this._runningReplicationsByContext.get(context);
    this._logger.log('pouchDb:syncManager', `Filter out given replication`, replication);
    const filteredReplications = runningReplicationsByContext.filter(candidate => candidate !== replication);
    this._runningReplicationsByContext.set(context, filteredReplications);
    this._logger.groupEnd('pouchDb:syncManager');
  }

  /**
   * Register event listeners on a specific replication handling state changes of this replication
   *
   * Watched state changes will be emitted on the PouchDbSyncManager itself as they appear.
   *
   * @param {Replication} replication
   * @private
   */
  _registerReplicationEventListeners(replication) {
    this._logger.groupStart('pouchDb:syncManager', `Registering event listeners for replication events `);
    this._logger.log('pouchDb:syncManager', `Given replication`, replication);
    this._logger.groupEnd('pouchDb:syncManager');

    // The moment a replication is started we first emit an 'alive' event
    // This is not guaranteed by PouchDB (eg. a uni-directional non-continuous replication might "jump" into transfer)
    this._emit('alive');

    replication.on('paused', error => {
      if (error) {
        // An error occured in a continous replication (We are currently offline)
        this._emit('offline', [error]);
        return;
      }

      this._emit('alive');
    });

    replication.on('active', () => {
      this._emit('transfer');
    });
  }

  /**
   * Returns whether there is at least one active replication for the
   * given context
   *
   * @param {PouchDB} context
   * @returns {boolean}
   */
  doesReplicationExistForContext(context) {
    if (this._runningReplicationsByContext.has(context) === false) {
      return false;
    }

    const replications = this._runningReplicationsByContext.get(context);
    return (replications.length > 0);
  }
}

PouchDbSyncManager.$inject = [
  'loggerService',
  '$q',
  'pouchDbContextService',
  'taskGateway',
];

export default PouchDbSyncManager;

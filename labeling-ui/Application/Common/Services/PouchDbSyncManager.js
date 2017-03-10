import PouchDb from 'pouchdb';

import DeepMap from '../Support/DeepMap'

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
        const pullReplication = this._getRemoteDbPullReplication(context, replicationTarget, true);
        const pushReplication = this._getRemoteDbPushReplication(context, replicationTarget, true);
        return this._$q.all([pullReplication, pushReplication]);
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
    const remoteDb = this._getRemoteDbForReplicationTarget(replicationTarget);
    return context.replicate.from(remoteDb, replicationOptions);
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
    const remoteDb = this._getRemoteDbForReplicationTarget(replicationTarget);
    return context.replicate.to(remoteDb, replicationOptions);
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
      .then(replicationInformation => `${replicationInformation.databaseServer}/${replicationInformation.databaseName}`);
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
}

PouchDbSyncManager.$inject = [
  'loggerService',
  '$q',
  'pouchDbContextService',
  'taskGateway',
];

export default PouchDbSyncManager;

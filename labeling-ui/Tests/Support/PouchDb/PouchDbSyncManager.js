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
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

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
    return this._$q.resolve();
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
    return this._$q.resolve();
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
    return this._$q.defer();
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
    return this._$q.resolve();
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

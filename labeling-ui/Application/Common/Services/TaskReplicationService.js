/**
 * Service for Timer related convenience
 */
class TaskReplicationService {
  /**
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {UserGateway} userGateway
   * @param {ReplicationStateService} replicationStateService
   * @param {TimerGateway} timerGateway
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbViewService} pouchDbViewService
   * @param {PouchDbViewHeater} pouchDbViewHeater
   */
  constructor($q, loggerService, userGateway, replicationStateService, timerGateway, pouchDbSyncManager, pouchDbContextService, pouchDbViewService, pouchDbViewHeater) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = loggerService;

    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;
    /**
     * @type {ReplicationStateService}
     * @private
     */
    this._replicationStateService = replicationStateService;
    /**
     * @type {TimerGateway}
     * @private
     */
    this._timerGateway = timerGateway;

    /**
     * @type {pouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

    /**
     * @type {PouchDbViewHeater}
     * @private
     */
    this._pouchDbViewHeater = pouchDbViewHeater;
  }

  replicateTaskDataToLocalMachine(project, task) {
    this._replicationStateService.setIsReplicating(true);

    return this._checkoutTaskFromRemote(task)
      .then(() => {
        if (!task.readOnly) {
          return this._createUserTaskTimerIfMissing(project, task);
        }
      })
      .then(() => this._replicationStateService.setIsReplicating(false));
  }

  /**
   * @param {Task} task
   * @private
   * @return {Promise}
   */
  _checkoutTaskFromRemote(task) {
    const loggerContext = 'pouchDb:taskSynchronization';
    this._logger.groupStartOpened(loggerContext, 'Started intial Task synchronization (before)');
    const context = this._pouchDbContextService.provideContextForTaskId(task.id);
    this._logger.log(loggerContext, 'Pulling task updates from server');

    return this._$q.resolve()
      .then(() => this._pouchDbSyncManager.pullUpdatesForContext(context))
      .then(() => this._pouchDbViewService.installDesignDocuments(task.id))
      .then(() => this._pouchDbViewHeater.heatAllViews(context))
      .then(() => {
        this._logger.log(loggerContext, 'Initial synchronizaton complete');
        this._logger.groupEnd(loggerContext);
      })
      .then(() => this._logger.log(loggerContext, 'Starting duplex live replication'))
      .then(() => this._pouchDbSyncManager.startDuplexLiveReplication(context))
      .then(() => this._logger.log(loggerContext, 'Duplex live replication stopped'))
      .catch(error => this._logger.warn('Error while checkoutTaskFromRemote', error));
  }


  /**
   * @param {Project} project
   * @param {Task} task
   * @return {AbortablePromise}
   * @private
   */
  _createUserTaskTimerIfMissing(project, task) {
    return this._userGateway.getCurrentUser().then(user => {
      return this._timerGateway.readOrCreateTimerIfMissingWithIdentification(project, task, user);
    });
  }

}


TaskReplicationService.$inject = [
  '$q',
  'loggerService',
  'userGateway',
  'replicationStateService',
  'timerGateway',
  'pouchDbSyncManager',
  'pouchDbContextService',
  'pouchDbViewService',
  'pouchDbViewHeater',
];

export default TaskReplicationService;

/**
 * Service for Timer related convenience
 */
class TaskReplicationService {
  /**
   * @param {Logger} logger
   * @param {UserGateway} userGateway
   * @param {ReplicationStateService} replicationStateService
   * @param {TimerGateway} timerGateway
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   */
  constructor(logger, userGateway, replicationStateService, timerGateway, pouchDbSyncManager, pouchDbContextService) {
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
  }

  replicateTaskDataToLocalMachine(projectId, taskId) {
    this._replicationStateService.setIsReplicating(true);
    const createTimerFn = this._createUserTaskTimerIfMissing.bind(this, projectId, taskId);

    return this._checkoutTaskFromRemote(taskId)
            .then(createTimerFn)
            .then(() => this._replicationStateService.setIsReplicating(false));
  }

  /**
   * @param taskId
   * @private
   * @return {Promise}
   */
  _checkoutTaskFromRemote(taskId) {
    const loggerContext = 'pouchDb:taskSynchronization';
    this._logger.groupStart(loggerContext, 'Started intial Task synchronization (before)');
    const context = this._pouchDbContextService.provideContextForTaskId(taskId);
    this._logger.log(loggerContext, 'Pulling task updates from server');

    return this._pouchDbSyncManager.pullUpdatesForContext(context)
      .then(() => {
        return this._pouchDbViewHeater.heatAllViews(context, 'annostation_');
      })
      .then(() => {
        return this._pouchDbSyncManager.startDuplexLiveReplication(context);
      })
      .then(() => {
        this._logger.log(loggerContext, 'Synchronizaton complete');
        this._logger.groupEnd('pouchDb:taskSynchronization');
      })
      .catch(error => {
        return this._logger.warn('Error while checkoutTaskFromRemote', error);
      });
  }


  _createUserTaskTimerIfMissing(projectId, taskId) {
    return this._userGateway.getCurrentUser().then(user => {
      return this._timerGateway.readOrCreateTimerIfMissingWithIdentification(projectId, taskId, user.id);
    });
  }

}


TaskReplicationService.$inject = [
  'loggerService',
  'userGateway',
  'replicationStateService',
  'timerGateway',
  'pouchDbSyncManager',
  'pouchDbContextService',
];

export default TaskReplicationService;

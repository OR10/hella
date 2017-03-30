/**
 * Service for Timer related convenience
 */
class TaskReplicationService {
  /**
   * @param {LoggerService} loggerService
   * @param {UserGateway} userGateway
   * @param {ReplicationStateService} replicationStateService
   * @param {TimerGateway} timerGateway
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbViewHeater} pouchDbViewHeater
   */
  constructor(loggerService, userGateway, replicationStateService, timerGateway, pouchDbSyncManager, pouchDbContextService, pouchDbViewHeater) {
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
     * @type {PouchDbViewHeater}
     * @private
     */
    this._pouchDbViewHeater = pouchDbViewHeater;
  }

  replicateTaskDataToLocalMachine(project, task) {
    this._replicationStateService.setIsReplicating(true);
    const createTimerFn = this._createUserTaskTimerIfMissing.bind(this, project, task);

    return this._checkoutTaskFromRemote(task)
      .then(createTimerFn)
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
  'loggerService',
  'userGateway',
  'replicationStateService',
  'timerGateway',
  'pouchDbSyncManager',
  'pouchDbContextService',
  'pouchDbViewHeater',
];

export default TaskReplicationService;

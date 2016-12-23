/**
 * Service for Timer related convenience
 */
class TaskReplicationService {
  /**
   * @param {UserGateway} userGateway
   * @param {TaskGateway} taskGateway
   * @param {ReplicationStateService} replicationStateSerivce
   * @param {TimerGateway} timerGateway
   */
  constructor(userGateway, taskGateway, replicationStateService, timerGateway) {
    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;
    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;
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
  }

  replicateTaskDataToLocalMachine(projectId, taskId) {
    this._replicationStateService.setIsReplicating(true);
    const createTimerFn = this._createUserTaskTimerIfMissing.bind(this, projectId, taskId);

    return this._taskGateway.checkoutTaskFromRemote(taskId)
            .then(createTimerFn)
            .then(() => this._replicationStateService.setIsReplicating(false));
  }

  _createUserTaskTimerIfMissing(projectId, taskId) {
    return this._userGateway.getCurrentUser().then(user => {
      return this._timerGateway.readOrCreateTimerIfMissingWithIdentification(projectId, taskId, user.id);
    });
  }

}


TaskReplicationService.$inject = [
  'userGateway',
  'taskGateway',
  'replicationStateService',
  'timerGateway',
];

export default TaskReplicationService;

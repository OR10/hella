/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {TaskGateway} taskGateway injected
   */
  constructor($scope, $state, taskGateway) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {number}
     */
    this.totalRows = 0;

    /**
     * @type {Array}
     */
    this.tasks = [];

    /**
     * @type {number}
     * @private
     */
    this._currentPage = 1;

    /**
     * @type {number}
     * @private
     */
    this._currentItemsPerPage = 0;

    // Reload upon request
    this._$scope.$on('task-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });
  }

  openTask(taskId) {
    this._$state.go('labeling.tasks.detail', {taskId});
  }

  unassignTask(taskId, assigneeId) {
    this._taskGateway.unassignUserFromTask(taskId, assigneeId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  reopenTask(taskId) {
    this._taskGateway.reopenTask(taskId).then(() => this._triggerReloadAll());
  }

  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

    this._currentPage = page;
    this._currentItemsPerPage = itemsPerPage;

    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;

    this._taskGateway.getTasksForProjectWithPhaseAndStatus(this.projectId, this.taskPhase, this.taskStatus, limit, offset)
      .then(result => {
        this.totalRows = result.totalRows;

        this.tasks = result.tasks.map(task => {
          const assignedUser = task.getLatestAssignedUserForPhase(this.taskPhase);
          return {
            id: task.id,
            type: task.taskType,
            title: task.video.name,
            range: `${task.metaData.frameRange.startFrameNumber} - ${task.metaData.frameRange.endFrameNumber}`,
            latestAssignee: assignedUser,
            status: this.taskStatus,
            labelInstruction: task.labelInstruction,
            reopen: task.reopen,
          };
        });

        this.loadingInProgress = false;
      });
  }

  _triggerReloadAll() {
    this._$scope.$emit('task-list:dependant-tasks-changed');
  }
}

TaskListController.$inject = [
  '$scope',
  '$state',
  'taskGateway',
];

export default TaskListController;

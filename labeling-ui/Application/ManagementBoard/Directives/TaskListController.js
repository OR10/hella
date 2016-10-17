/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {TaskGateway} taskGateway injected
   * @param {ModalService} modalService
   */
  constructor($scope, $state, taskGateway, modalService) {
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
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {Object}
     * @private
     */
    this._rawTasksById = {};

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
    // If this is the users task open it
    if (this._rawTasksById[taskId].isUsersTask(this.user)) {
      this.goToTask(taskId, this.taskPhase);
      return;
    }

    // If it is not the users tasks check if assignment is possible
    if (!this._rawTasksById[taskId] || this._rawTasksById[taskId].isUserAllowedToAssign(this.user)) {
      this.loadingInProgress = true;
      this._taskGateway.assignAndMarkAsInProgress(taskId).then(() => {
        this.goToTask(taskId, this.taskPhase);
      });
    } else {
      const modal = this._modalService.getInfoDialog({
        title: 'Task already assigned',
        headline: 'This task is already assigned to someone else',
        message: 'This task is already assigned to someone else. You are only allowed to open it in real only mode',
        confirmButtonText: 'Open read only',
        cancelButtonText: 'Cancel',
      }, () => {
        this.goToTask(taskId, this.taskPhase);
      });
      modal.activate();
    }
  }

  goToTask(taskId, phase) {
    this._$state.go('labeling.tasks.detail', {taskId, phase});
  }

  unassignTask(taskId, assigneeId) {
    this._taskGateway.unassignUserFromTask(taskId, assigneeId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  reopenTask(taskId, phase) {
    this._taskGateway.reopenTask(taskId, phase).then(() => this._triggerReloadAll());
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

        result.tasks.forEach(task => {
          this._rawTasksById[task.id] = task;
        });

        this.tasks = result.tasks.map(task => {
          const assignedUser = task.getLatestAssignedUserForPhase(this.taskPhase);
          return {
            id: task.id,
            type: task.taskType,
            title: task.video.name,
            range: `${task.frameNumberMapping[0]} - ${task.frameNumberMapping[task.frameNumberMapping.length - 1]}`,
            latestAssignee: assignedUser,
            status: task.getStatusForPhase(this.taskPhase),
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
  'modalService',
];

export default TaskListController;

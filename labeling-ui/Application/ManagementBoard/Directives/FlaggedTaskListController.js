/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {TaskGateway} taskGateway
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
     * @type {Array}
     * @private
     */
    this._rawTasksById = [];

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

    // Initital load of the list
    this.updatePage(this._currentPage, this._currentItemsPerPage);
  }

  /**
   * @param taskId
   */
  unflagTask(taskId) {
    this._modalService.info(
      {
        title: 'Unflag',
        headline: 'Do you want to unflag this Task?',
        message: 'You are about to unflag this task. Are you sure you want to do this?',
        confirmButtonText: 'Unflag',
      },
      () => {
        this._taskGateway.unflagTask(taskId)
          .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
      }
    );
  }

  openTask(taskId) { // eslint-disable-line no-unused-vars
    // Which phase should we use?!
    // this._$state.go('labeling.tasks.detail', {taskId, phase});
  }

  /**
   * @param {number} page
   * @param {number} itemsPerPage
   */
  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

    this._currentPage = page;
    this._currentItemsPerPage = itemsPerPage;

    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;

    this._taskGateway.getFlaggedTasks(this.project.id, limit, offset)
      .then(result => {
        this.totalRows = result.totalRows;

        result.tasks.forEach(task => {
          this._rawTasksById[task.id] = task;
        });

        /**
         * @type {Array.<Task>}
         */
        this.tasks = result.tasks.map(task => {
          const assignedUser = task.getLatestAssignedUserForPhase(task.getPhase());
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
}

TaskListController.$inject = [
  '$scope',
  '$state',
  'taskGateway',
  'modalService',
];

export default TaskListController;

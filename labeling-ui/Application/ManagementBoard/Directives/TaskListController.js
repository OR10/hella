/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$state} $state
   * @param {TaskGateway} taskGateway injected
   */
  constructor($state, taskGateway) {
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
  }

  openTask(taskId) {
    this._$state.go('labeling.tasks.detail', {taskId});
  }

  unassignTask(taskId, assigneeId) {
    this._taskGateway.unassignUserFromTask(taskId, assigneeId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

    this._currentPage = page;
    this._currentItemsPerPage = itemsPerPage;

    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;

    this._taskGateway.getTasksForProject(this.projectId, this.taskStatus, limit, offset).then(response => {
      this.totalRows = response.totalRows;

      this.tasks = response.result.map(task => {
        return {
          id: task.id,
          type: task.taskType,
          title: task.video.name,
          range: `${task.metaData.frameRange.startFrameNumber} - ${task.metaData.frameRange.endFrameNumber}`,
          assignee: task.assignedUser,
          assigneeId: task.assignedUserId,
        };
      });

      this.loadingInProgress = false;
    });
  }
}

TaskListController.$inject = [
  '$state',
  'taskGateway',
];

export default TaskListController;

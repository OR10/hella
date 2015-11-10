/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {TaskGateway} taskGateway injected
   */
  constructor(taskGateway) {
    /**
     * List of tasks rendered by the directive
     * @type {Array.<Task>}
     */
    this.tasks = [];


    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    this._loadTaskList();
  }

  /**
   * Retrieve a fresh list of {@link Task} objects from the backend.
   *
   * Once the retrieval operation is finished the {@link TaskListController#tasks} will be automatically updated
   * to the new list.
   *
   * @private
   */
  _loadTaskList() {
    this._taskGateway.getTasks()
      .then((tasks) => {
        this.tasks = tasks;
      });
  }
}

TaskListController.$inject = ['taskGateway'];

export default TaskListController;

/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {TaskGateway} taskGateway injected
   */
  constructor(taskGateway) {
    /**
     * @type {TaskGateway}
     */
    this.taskGateway = taskGateway;

    /**
     * List of retrieved {@link Tasks}
     *
     * @type {Array.<Task>}
     */
    this.tasks = null;

    this.loadTaskList();
  }

  /**
   * Retrieve a fresh list of {@link Task} objects from the backend.
   *
   * Once the retrieval operation is finished the {@link TaskListController#tasks} will be automatically updated
   * to the new list.
   */
  loadTaskList() {
    this.taskGateway.getTasks()
      .then((tasks) => {
        this.tasks = tasks;
      });
  }
}

TaskListController.$inject = ['taskGateway'];

export default TaskListController;

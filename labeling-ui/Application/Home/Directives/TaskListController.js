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
     * @type {null|Array.<Task>}
     */
    this.tasks = null;


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
    this._taskGateway.getTasksAndVideos()
      .then(({tasks, videos}) => {
        tasks.forEach(task => task.video = videos[task.videoId]);
        this.tasksWithVideo = tasks;
      });
  }
}

TaskListController.$inject = ['taskGateway'];

export default TaskListController;

export default class TaskListController {
  /**
   * @param {TaskGateway} taskGateway
   */
  constructor(taskGateway) {
    this.taskGateway = taskGateway;

    this.tasks = null;

    this.loadTaskList();
  }

  loadTaskList() {
    this.taskGateway.getTasks()
      .then((tasks) => {
        this.tasks = tasks;
      });
  }
}

TaskListController.$inject = ['taskGateway'];

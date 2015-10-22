export default class TaskListController {
  /**
   * @param {TaskService} taskListService
   */
  constructor(taskListService) {
    this.taskListService = taskListService;

    this.tasks = null;

    this.loadTaskList();
  }

  loadTaskList() {
    this.taskListService.getTasks()
      .then((tasks) => {
        this.tasks = tasks;
      });
  }
}

TaskListController.$inject = ['taskService'];

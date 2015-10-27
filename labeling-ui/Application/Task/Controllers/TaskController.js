export default class TaskController {
  /**
   * @param {Task} task
   */
  constructor(task) {
    /**
     * @type {Task}
     */
    this.task = task;
    this.frameNumber = 1;
  }
}

TaskController.$inject = ['task'];


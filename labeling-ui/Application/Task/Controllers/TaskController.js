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

  frameForward() {
    if (this.frameNumber < this.task.frameRange.endFrameNumber) {
      this.frameNumber++;
    }
  }

  frameBackward() {
    if (this.frameNumber > this.task.frameRange.startFrameNumber) {
      this.frameNumber--;
    }
  }
}

TaskController.$inject = ['task'];


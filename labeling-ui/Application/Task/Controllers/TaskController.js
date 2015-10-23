export default class TaskController {
  constructor(task) {
    this.task = task;
    this.frameNumber = 1;
  }

  frameForward() {
    if (this.frameNumber < this.task.frame_range.end_frame_number) {
      this.frameNumber++;
    }
  }

  frameBackward() {
    if (this.frameNumber > this.task.frame_range.start_frame_number) {
      this.frameNumber--;
    }
  }
}

TaskController.$inject = ['task'];


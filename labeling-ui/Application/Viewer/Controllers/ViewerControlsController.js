/**
 * @class ViewerControlsController
 */
export default class ViewerControlsController {
  constructor() {

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

/**
 * Controller handling the control elements below the viewer frame
 *
 * @class ViewerControlsController
 * @property {Function} onPreviousFrameRequested
 * @property {Function} onNextFrameRequested
 */
export default class ViewerControlsController {
  handleNextFrameClicked() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameClicked() {
    this.onPreviousFrameRequested();
  }
}

ViewerControlsController.$inject = [];

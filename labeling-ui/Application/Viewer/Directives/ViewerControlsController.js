/**
 * Controller handling the control elements below the viewer frame
 *
 * @class ViewerControlsController
 * @property {Function} onPreviousFrameRequested
 * @property {Function} onNextFrameRequested
 * @property {Function} onNewLabeledThingRequested
 */
export default class ViewerControlsController {
  handleNextFrameClicked() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameClicked() {
    this.onPreviousFrameRequested();
  }

  handleNewLabeledThingClicked() {
    this.onNewLabeledThingRequested();
  }
}

ViewerControlsController.$inject = [];

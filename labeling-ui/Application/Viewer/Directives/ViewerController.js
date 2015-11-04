/**
 * @class ViewerController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onNextFrameRequested
 * @property {Function} onPreviousFrameRequested
 */
export default class ViewerController {
  handleNewThing(shapes) {
    this.onNewThing({shapes});
  }

  handleUpdatedThing(labeledThing) {
    this.onUpdatedThing({labeledThing});
  }

  handleNextFrameRequested() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameRequested() {
    this.onPreviousFrameRequested();
  }
}

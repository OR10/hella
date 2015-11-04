/**
 * @class ViewerController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onNextFrameRequested
 * @property {Function} onPreviousFrameRequested
 * @property {Function} onNewLabeledThingRequested
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

  handleNewLabeledThingRequested() {
    this.onNewLabeledThingRequested();
  }
}

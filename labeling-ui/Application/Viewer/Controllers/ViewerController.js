/**
 * @class ViewerController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onNextFrameRequested
 * @property {Function} onPreviousFrameRequested
 */
export default class ViewerController {
  handleNewThing(id, thing) {
    this.onNewThing({id, thing});
  }

  handleUpdatedThing(id, thing) {
    this.onUpdatedThing({id, thing});
  }

  handleNextFrameRequested() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameRequested() {
    this.onPreviousFrameRequested();
  }
}

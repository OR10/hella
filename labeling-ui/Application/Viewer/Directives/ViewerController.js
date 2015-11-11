/**
 * @class ViewerController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onSelectedThing
 * @property {Function} onDeselectedThing
 * @property {Function} onNextFrameRequested
 * @property {Function} onPreviousFrameRequested
 * @property {Function} onNewLabeledThingRequested
 */
export default class ViewerController {
  constructor() {
    this.filters = [];
  }

  handleFilterChanged(filters) {
    this.filters = filters;
  }

  handleNewThing(shapes) {
    this.onNewThing({shapes});
  }

  handleUpdatedThing(labeledThing) {
    this.onUpdatedThing({labeledThing});
  }

  handleSelectedThing(labeledThing) {
    this.onSelectedThing({labeledThing});
  }

  handleDeselectedThing() {
    this.onDeselectedThing();
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

  handleNewEllipseRequested() {
    this.onNewEllipseRequested();
  }

  handleNewCircleRequested() {
    this.onNewCircleRequested();
  }

  handleNewPolygonRequested() {
    this.onNewPolygonRequested();
  }

  handleNewLineRequested() {
    this.onNewLineRequested();
  }

  handleMoveToolRequested() {
    this.onMoveToolRequested();
  }

}

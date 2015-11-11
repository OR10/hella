import Filters from '../Models/Filters';

/**
 * @class ViewerController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onSelectedThing
 * @property {Function} onDeselectedThing
 * @property {Function} onNewLabeledThingRequested
 *
 * @property {Task} task
 * @property {FramePosition} framePosition
 */
export default class ViewerController {
  constructor() {
    this.filters = new Filters();
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

  handleNewLabeledThingRequested() {
    this.onNewLabeledThingRequested();
  }

  handleNewEllipseRequested() {
    this.onNewEllipseRequested();
  }

  handleNewCircleRequested() {
    this.onNewCircleRequested();
  }

}

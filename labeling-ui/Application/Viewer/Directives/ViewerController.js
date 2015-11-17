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
}

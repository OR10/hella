import Filters from '../Models/Filters';

/**
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape} selectedPaperShape
 * @property {string} activeTool
 * @property {string} selectedDrawingTool
 */
class ViewerController {
  constructor() {
    /**
     * @type {Filters}
     */
    this.filters = new Filters();
  }
}

ViewerController.$inject = [
];

export default ViewerController;


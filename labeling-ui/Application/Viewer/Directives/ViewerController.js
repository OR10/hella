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

    /**
     * @type {Tool|null}
     */
    this.activeTool = null;

    /**
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

    /**
     * @type {LabeledThingInFrame|null}
     */
    this.selectedLabeledThingInFrame = null;

    /**
     * A structure holding all LabeledThingInFrames for the currently active frame
     *
     * @type {Object<string|LabeledThingInFrame>|null}
     */
    this.labeledThingsInFrame = null;

    /**
     * A structure holding all LabeledThings for the currently active frame
     *
     * @type {Object<string|LabeledThing>|null}
     */
    this.labeledThings = null;
  }
}

ViewerController.$inject = [];

export default ViewerController;


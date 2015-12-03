import BrightnessFilter from '../Filters/BrightnessFilter';
import ContrastFilter from '../Filters/ContrastFilter';
import LabeledThing from '../../LabelingData/Models/LabeledThing';
import LabeledThingInFrame from '../../LabelingData/Models/LabeledThingInFrame';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @property {Task} task
 * @property {Filters} filters
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape} selectedPaperShape
 * @property {string} activeTool
 * @property {string} selectedDrawingTool
 */
class ViewerControlsController {
  /**
   * @param {angular.$scope} $scope
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {InterpolationService} interpolationService
   * @param {EntityIdService} entityIdService
   * @param {angular.$q} $q
   */
  constructor($scope, labeledThingInFrameGateway, labeledThingGateway, interpolationService, entityIdService, $q) {
    /**
     * Template name used for the brightnessSlider button popover
     *
     * @type {string}
     */
    this.brightnessSliderTemplate = 'Viewer/ViewerControlsDirective/BrightnessSlider.html';

    /**
     * Template name used for the contrastSlider button popover
     *
     * @type {string}
     */
    this.contrastSliderTemplate = 'Viewer/ViewerControlsDirective/ContrastSlider.html';

    /**
     * Value of the brightness slider
     *
     * @type {int}
     */
    this.brightnessSliderValue = 0;

    /**
     * Value of the contrast slider
     *
     * @type {int}
     */
    this.contrastSliderValue = 0;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {InterpolationService}
     * @private
     */
    this._interpolationService = interpolationService;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * Currently active {@link BrightnessFilter}
     *
     * @type {BrightnessFilter|null}
     * @private
     */
    this._brightnessFilter = null;

    /**
     * Currently active {@link ContrastFilter}
     *
     * @type {ContrastFilter|null}
     * @private
     */
    this._constrastFilter = null;

    // Update BrightnessFilter if value changed
    $scope.$watch('vm.brightnessSliderValue', newBrightness => {
      const newFilter = new BrightnessFilter(newBrightness);
      if (!this._brightnessFilter) {
        this.filters.addFilter(newFilter);
      } else {
        this.filters.replaceFilter(this._brightnessFilter, newFilter);
      }
      this._brightnessFilter = newFilter;
    });

    // Update ContrastFilter if value changed
    $scope.$watch('vm.contrastSliderValue', newContrast => {
      const newFilter = new ContrastFilter(newContrast);
      if (!this._constrastFilter) {
        this.filters.addFilter(newFilter);
      } else {
        this.filters.replaceFilter(this._constrastFilter, newFilter);
      }
      this._constrastFilter = newFilter;
    });
  }

  /**
   * Set new `startFrameNumber` based once **Bracket open** button is clicked
   */
  handleSetOpenBracketClicked() {
    const framePosition = this.framePosition.position;
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (framePosition > selectedLabeledThing.frameRange.endFrameNumber) {
      return;
    }

    selectedLabeledThing.frameRange.startFrameNumber = framePosition;
    this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
  }

  /**
   * Jump to the `startFrameNumber` of the selected {@link LabeledThing}
   */
  handleGotoOpenBracketClicked() {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    this.framePosition.goto(selectedLabeledThing.frameRange.startFrameNumber);
  }

  /**
   * Advance one frame
   */
  handleNextFrameClicked() {
    this.framePosition.next();
  }

  /**
   * Go one frame back
   */
  handlePreviousFrameClicked() {
    this.framePosition.previous();
  }

  /**
   * Jump to the `endFrameNumber` of the selected {@link LabeledThing}
   */
  handleGotoCloseBracketClicked() {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    this.framePosition.goto(selectedLabeledThing.frameRange.endFrameNumber);
  }

  /**
   * Set new `endFrameNumber` based once **Bracket close** button is clicked
   */
  handleSetCloseBracketClicked() {
    const framePosition = this.framePosition.position;
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (framePosition < selectedLabeledThing.frameRange.startFrameNumber) {
      return;
    }

    selectedLabeledThing.frameRange.endFrameNumber = framePosition;
    this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
  }

  /**
   * Create a new {@link LabeledThingInFrame} with a corresponding {@link LabeledThing} and store both
   * {@link LabeledObject}s to the backend
   *
   * @returns {AbortablePromise.<LabeledThingInFrame>}
   * @private
   */
  _createNewLabeledThingInFrame() {
    const newLabeledThingId = this._entityIdService.getUniqueId();
    const newLabeledThingInFrameId = this._entityIdService.getUniqueId();

    const newLabeledThing = new LabeledThing({
      id: newLabeledThingId,
      classes: [],
      incomplete: true,
      task: this.task,
      frameRange: {
        startFrameNumber: this.framePosition.position,
        endFrameNumber: this.framePosition.position,
      },
    });

    const newLabeledThingInFrame = new LabeledThingInFrame({
      id: newLabeledThingInFrameId,
      classes: [],
      incomplete: true,
      frameNumber: this.framePosition.position,
      labeledThing: newLabeledThing,
      shapes: [],
    });

    return this._labeledThingGateway.saveLabeledThing(newLabeledThing)
      .then(() => {
        return this._labeledThingInFrameGateway.saveLabeledThingInFrame(newLabeledThingInFrame);
      })
      .then(() => {
        /* @TODO maybe we don't need to wait for the backend before we update the scope here but i left it in for now
         * in lieu of proper error handling
         */
        this.labeledThingsInFrame[newLabeledThingInFrame.id] = newLabeledThingInFrame;

        //@TODO: Handle properly after refactoring to only use selectedPaperShape
        //       Most likely this needs to be moved to the thing layer somehow
//        this.selectedLabeledThingInFrame = newLabeledThingInFrame;
      });
  }

  /**
   * Handle the creation of new rectangle
   */
  handleNewLabeledThingClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'rectangle';
      });
  }

  /**
   * Handle the creation of new ellipse
   */
  handleNewEllipseClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'ellipse';
      });
  }

  /**
   * Handle the creation of new circle
   */
  handleNewCircleClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'circle';
      });
  }

  /**
   * Handle the creation of new path
   */
  handleNewPathClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'path';
      });
  }

  /**
   * Handle the creation of new line
   */
  handleNewLineClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'line';
      });
  }

  /**
   * Handle the creation of new polygon
   */
  handleNewPolygonClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'polygon';
      });
  }

  /**
   * Handle the creation of new point
   */
  handleNewPointClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'point';
      });
  }

  /**
   * Handle the switch to the move tool
   */
  handleMoveToolClicked() {
    this.activeTool = 'move';
  }

  /**
   * Handle the switch to the scale tool
   */
  handleScaleToolClicked() {
    this.activeTool = 'scale';
  }

  /**
   * Execute the interpolation
   */
  handleInterpolation() {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    this._interpolationService.interpolate('default', this.task, selectedLabeledThing);
    // @TODO: Inform other parts of the application to reload LabeledThingsInFrame after interpolation is finished
    // @TODO: Show some sort of loading indicator, while interpolation is running
  }
}

ViewerControlsController.$inject = [
  '$scope',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'interpolationService',
  'entityIdService',
  '$q',
];

export default ViewerControlsController;

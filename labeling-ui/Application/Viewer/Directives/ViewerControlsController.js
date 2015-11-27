import BrightnessFilter from '../Filters/BrightnessFilter';
import ContrastFilter from '../Filters/ContrastFilter';
import LabeledThing from '../../LabelingData/Models/LabeledThing';
import LabeledThingInFrame from '../../LabelingData/Models/LabeledThingInFrame';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @property {FramePosition} framePosition Structure representing the currently displayed frame within the viewer.
 * @property {Function} onNewLabeledThingRequested
 *
 * @property {Filters} filters
 */
class ViewerControlsController {
  /**
   * @param {angular.$scope} $scope
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {EntityIdService} entityIdService
   * @param {angular.$q} $q
   */
  constructor($scope, labeledThingInFrameGateway, labeledThingGateway, entityIdService, $q) {
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    this._labeledThingGateway = labeledThingGateway;
    this._entityIdService = entityIdService;
    this._$q = $q;

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
     * @type {int}
     */
    this.contrastSliderValue = 0;


    /**
     * Currently active {@link BrightnessFilter}
     *
     * @type {BrightnessFilter|null}
     * @private
     */
    this._brightnessFilter = null;

    /**
     * Currently active {@link ContrastFilter}
     * @type {ContrastFilter|null}
     *
     * @private
     */
    this._constrastFilter = null;

    /**
     * @type {string}
     */
    this.selectedDrawingTool = 'rectangle';

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

  handleGotoOpenBracketClicked() {
    // @TODO: Maybe it is better to track something like `selectedThing` in addition to
    //        `selectedThingInFrame` and pass it down to this directive
    this._labeledThingGateway.getLabeledThing(
      this.task.id,
      this.selectedLabeledThingInFrame.labeledThingId
      )
      .then(labeledThing => this.framePosition.goto(labeledThing.frameRange,startFrameNumber));
  }

  handleNextFrameClicked() {
    this.framePosition.next();
  }

  handlePreviousFrameClicked() {
    this.framePosition.previous();
  }

  handleGotoCloseBracketClicked() {
    // @TODO: Maybe it is better to track something like `selectedThing` in addition to
    //        `selectedThingInFrame` and pass it down to this directive
    this._labeledThingGateway.getLabeledThing(
      this.task.id,
      this.selectedLabeledThingInFrame.labeledThingId
    )
    .then(labeledThing => this.framePosition.goto(labeledThing.frameRange,endFrameNumber));
  }

  _createNewLabeledThingInFrame() {
    const labeledThingId = this._entityIdService.getUniqueId();
    const labeledThingInFrameId = this._entityIdService.getUniqueId();

    const labeledThing = new LabeledThing({
      id: labeledThingId,
      classes: [],
      incomplete: true,
      taskId: this.task.id,
      frameRange: {
        startFrameNumber: this.framePosition.startFrameNumber,
        endFrameNumber: this.framePosition.endFrameNumber,
      },
    });

    const labeledThingInFrame = new LabeledThingInFrame({
      id: labeledThingInFrameId,
      classes: [],
      incomplete: true,
      frameNumber: this.framePosition.position,
      labeledThingId: labeledThingId,
      shapes: [],
    });

    return this._labeledThingGateway.saveLabeledThing(labeledThing)
      .then(() => {
        return this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
      })
      .then(() => {
        /* @TODO maybe we don't need to wait for the backend before we update the scope here but i left it in for now
         * in lieu of proper error handling
         */
        this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
        this.selectedLabeledThingInFrame = labeledThingInFrame;
      });
  }

  handleNewLabeledThingClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'rectangle';
      });
  }

  handleNewEllipseClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'ellipse';
      });
  }

  handleNewCircleClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'circle';
      });
  }

  handleNewPathClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'path';
      });
  }

  handleNewLineClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'line';
      });
  }

  handleNewPolygonClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'polygon';
      });
  }

  handleNewPointClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.activeTool = 'point';
      });
  }

  handleMoveToolClicked() {
    this.activeTool = 'move';
  }

  handleScaleToolClicked() {
    this.activeTool = 'scale';
  }
}

ViewerControlsController.$inject = [
  '$scope',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'entityIdService',
  '$q',
];

export default ViewerControlsController;

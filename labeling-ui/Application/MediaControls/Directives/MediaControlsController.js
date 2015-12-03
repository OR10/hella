import BrightnessFilter from '../../Common/Filters/BrightnessFilter';
import ContrastFilter from '../../Common/Filters/ContrastFilter';
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
class MediaControlsController {
  /**
   * @param {angular.$scope} $scope
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {InterpolationService} interpolationService
   * @param {EntityIdService} entityIdService
   * @param {angular.$q} $q
   */
  constructor($scope, labeledThingInFrameGateway, labeledThingGateway, interpolationService, entityIdService, $q) {
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    this._labeledThingGateway = labeledThingGateway;
    this._interpolationService = interpolationService;
    this._entityIdService = entityIdService;
    this._$q = $q;

    /**
     * Template name used for the brightnessSlider button popover
     *
     * @type {string}
     */
    this.brightnessSliderTemplate = 'MediaControls/MediaControlsDirective/BrightnessSlider.html';

    /**
     * Template name used for the contrastSlider button popover
     *
     * @type {string}
     */
    this.contrastSliderTemplate = 'MediaControls/MediaControlsDirective/ContrastSlider.html';

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

  handleSetOpenBracketClicked() {
    const framePosition = this.framePosition.position;

    if (framePosition > this.selectedLabeledThing.frameRange.endFrameNumber) {
      return;
    }

    this.selectedLabeledThing.frameRange.startFrameNumber = framePosition;
    this._labeledThingGateway.saveLabeledThing(this.selectedLabeledThing);
  }

  handleGotoOpenBracketClicked() {
    this.framePosition.goto(this.selectedLabeledThing.frameRange.startFrameNumber);
  }

  handleNextFrameClicked() {
    this.framePosition.next();
  }

  handlePreviousFrameClicked() {
    this.framePosition.previous();
  }

  handleGotoCloseBracketClicked() {
    this.framePosition.goto(this.selectedLabeledThing.frameRange.endFrameNumber);
  }

  handleSetCloseBracketClicked() {
    const framePosition = this.framePosition.position;

    if (framePosition < this.selectedLabeledThing.frameRange.startFrameNumber) {
      return;
    }

    this.selectedLabeledThing.frameRange.endFrameNumber = framePosition;
    this._labeledThingGateway.saveLabeledThing(this.selectedLabeledThing);
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
        startFrameNumber: this.framePosition.position,
        endFrameNumber: this.framePosition.position,
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
        this.labeledThings[labeledThingId] = labeledThing;
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

  handleInterpolation() {
    this._interpolationService.interpolate('default', this.task, this.selectedLabeledThingInFrame.labeledThing);
    // @TODO: Inform other parts of the application to reload LabeledThingsInFrame after interpolation is finished
    // @TODO: Show some sort of loading indicator, while interpolation is running
  }

  handlePlay() {
    this.playing = true;
  }

  handlePause() {
    this.playing = false;
  }
}

MediaControlsController.$inject = [
  '$scope',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'interpolationService',
  'entityIdService',
  '$q',
];

export default MediaControlsController;

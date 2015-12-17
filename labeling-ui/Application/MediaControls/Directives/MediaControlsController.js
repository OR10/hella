import paper from 'paper';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @property {Task} task
 * @property {Video} video
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape} selectedPaperShape
 * @property {string} activeTool
 * @property {string} selectedDrawingTool
 * @property {boolean} hideLabeledThingsInFrame
 * @property {Tool} newShapeDrawingTool
 */
class MediaControlsController {
  /**
   * @param {angular.$scope} $scope
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {InterpolationService} interpolationService
   * @param {EntityIdService} entityIdService
   * @param {LoggerService} logger
   * @param {angular.$q} $q
   */
  constructor($scope, labeledThingInFrameGateway, labeledThingGateway, interpolationService, entityIdService, logger, $q) {
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
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    // Disable Zoom Tool if the panel is closed
    $scope.$watch('vm.popupPanelState', (newState, oldState) => {
      if (oldState === 'zoom' && newState !== 'zoom') {
        this.activeTool = null;
      }
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
   * Handle the toggle of hiding all non selected {@link LabeledThingInFrame}
   */
  handleHideLabeledThingsInFrameToggle() {
    this.hideLabeledThingsInFrame = !this.hideLabeledThingsInFrame;
  }


  /**
   * Handle the creation of new rectangle
   */
  handleNewLabeledThingClicked() {
    const expanse = 50;
    const center = new paper.Point(this.video.metaData.width / 2, this.video.metaData.height / 2);
    const topLeft = new paper.Point(center.x - expanse, center.y - expanse);
    const bottomRight = new paper.Point(center.x + expanse, center.y + expanse);

    this._logger.log('mediacontrols:newlabeledthing', `Creating new Shape: topLeft: ${topLeft}, bottomRight: ${bottomRight} (center: ${center})`);

    this.newShapeDrawingTool.startShape(topLeft);
    this.newShapeDrawingTool.updateShape(bottomRight);
    this.newShapeDrawingTool.completeShape();
  }

  /**
   * Handle the creation of new ellipse
   */
  handleNewEllipseClicked() {
    this.activeTool = 'ellipse';
  }

  /**
   * Handle the creation of new circle
   */
  handleNewCircleClicked() {
    this.activeTool = 'circle';
  }

  /**
   * Handle the creation of new path
   */
  handleNewPathClicked() {
    this.activeTool = 'path';
  }

  /**
   * Handle the creation of new line
   */
  handleNewLineClicked() {
    this.activeTool = 'line';
  }

  /**
   * Handle the creation of new polygon
   */
  handleNewPolygonClicked() {
    this.activeTool = 'polygon';
  }

  /**
   * Handle the creation of new point
   */
  handleNewPointClicked() {
    this.activeTool = 'point';
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

  handlePlay() {
    this.playing = true;
  }

  handlePause() {
    this.playing = false;
  }

  handleVideoSettingsClicked() {
    switch (this.popupPanelState) {
      case 'videosettings':
        this.popupPanelState = false;
        break;
      default:
        this.popupPanelState = 'videosettings';
    }
  }

  handleZoomClicked() {
    switch (this.popupPanelState) {
      case 'zoom':
        this.popupPanelState = false;
        break;
      default:
        this.popupPanelState = 'zoom';
    }
  }

}

MediaControlsController.$inject = [
  '$scope',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'interpolationService',
  'entityIdService',
  'loggerService',
  '$q',
];

export default MediaControlsController;

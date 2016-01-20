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
   * @param {Object} applicationState
   * @param {ModalService} modalService
   * @param {DataContainer} labeledThingData
   * @param {LabeledThingInFrameDataContainer} labeledThingInFrameData
   * @param {DataPrefetcher} dataPrefetcher
   */
  constructor(
    $scope,
    labeledThingInFrameGateway,
    labeledThingGateway,
    interpolationService,
    entityIdService,
    logger,
    $q,
    applicationState,
    modalService,
    labeledThingData,
    labeledThingInFrameData,
    dataPrefetcher
  ) {
    /**
     * @type {boolean}
     */
    this.mediaControlsDisabled = false;

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

    /**
     * @type {Object}
     * @private
     */
    this._applicationState = applicationState;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {DataContainer}
     * @private
     */
    this._labeledThingInFrameData = labeledThingInFrameData;

    /**
     * @type {DataContainer}
     * @private
     */
    this._labeledThingData = labeledThingData;

    /**
     * @type {DataPrefetcher}
     * @private
     */
    this._dataPrefetcher = dataPrefetcher;

    /**
     * @type {string}
     */
    this.popupPanelState = 'zoom';

    /**
     * @type {boolean}
     */
    this.popupPanelOpen = false;

    this.fpsInputVisible = false;

    // Disable Zoom Tool if the panel is closed
    $scope.$watchGroup(
      ['vm.popupPanelState', 'vm.popupPanelOpen'], ([newState, newOpen], [oldState]) => {
        if ((oldState === 'zoom' && newState !== 'zoom') || newOpen === false) {
          if (typeof this.activeTool === 'string' && this.activeTool.indexOf('zoom') === 0) {
            this.activeTool = null;
          }
        }
      }
    );

    this._applicationState.$watch('mediaControls.isDisabled', disabled => this.mediaControlsDisabled = disabled);
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
   * Switch to the currently bookmarked frame
   */
  goToBookmarkedFrame() {
    if (this.bookmarkedFrameNumber) {
      this.framePosition.goto(this.bookmarkedFrameNumber);
    }
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

    this._logger.log(
      'mediacontrols:newlabeledthing',
      `Creating new Shape: topLeft: ${topLeft}, bottomRight: ${bottomRight} (center: ${center})`
    );

    this.newShapeDrawingTool.startShape(topLeft, bottomRight);
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
    this._applicationState.disableAll();
    this._labeledThingData.invalidate(selectedLabeledThing.id);
    this._labeledThingInFrameData.invalidateLabeledThing(selectedLabeledThing);
    this._interpolationService.interpolate('default', this.task, selectedLabeledThing)
      .then(
        () => {
          this._dataPrefetcher.prefetchLabeledThingsInFrame(this.task, this.task.frameRange.startFrameNumber);
          this._dataPrefetcher.prefetchSingleLabeledThing(this.task, selectedLabeledThing, this.task.frameRange.startFrameNumber, true);
          this._applicationState.enableAll();
        }
      )
      .catch(
        error => {
          this._applicationState.enableAll();
          throw error;
        }
      );

    // @TODO: Inform other parts of the application to reload LabeledThingsInFrame after interpolation is finished
  }

  handleDeleteSelectionClicked() {
    const deleteQuestion = this._modalService.getWarningDialog({
      title: 'Remove shape',
      headline: 'The selected shape is going to be removed. Proceed?',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }, () => this._deleteSelectedShape());
    deleteQuestion.activate();
  }

  _deleteSelectedShape() {
    const selectedLabeledThingInFrame = this.selectedPaperShape.labeledThingInFrame;
    const selectedLabeledThing = selectedLabeledThingInFrame.labeledThing;

    this._applicationState.disableAll();

    this._labeledThingData.invalidate(selectedLabeledThing.id);
    this._labeledThingInFrameData.invalidateLabeledThing(selectedLabeledThing);

    this._labeledThingGateway.deleteLabeledThing(selectedLabeledThing)
      .then(
        () => {
          this.selectedPaperShape = null;
          this.labeledThingsInFrame = this.labeledThingsInFrame.filter(
            labeledThingInFrame => labeledThingInFrame.id !== selectedLabeledThingInFrame.id
          );
          this._applicationState.enableAll();
        }
      )
      .catch(
        error => {
          this._applicationState.enableAll();
          throw error;
        }
      );
  }

  handlePlay() {
    this.playing = true;
    this.playbackDirection = 'forwards';
    this.playbackSpeedFactor = 1;
  }

  handlePause() {
    this.playing = false;
  }

  fastForward() {
    this.playing = true;
    this.playbackDirection = 'forwards';
    this.playbackSpeedFactor = 11;
  }

  rewind() {
    this.playing = true;
    this.playbackDirection = 'backwards';
    this.playbackSpeedFactor = 11;
  }

  handleVideoSettingsClicked() {
    switch (this.popupPanelState) {
      case 'videosettings':
        this.popupPanelOpen = !this.popupPanelOpen;
        break;
      default:
        this.popupPanelState = 'videosettings';
        this.popupPanelOpen = true;
    }
  }

  handleZoomClicked() {
    switch (this.popupPanelState) {
      case 'zoom':
        this.popupPanelOpen = !this.popupPanelOpen;
        break;
      default:
        this.popupPanelState = 'zoom';
        this.popupPanelOpen = true;
    }
  }

  showGeneralSettings() {
    this.fpsInputVisible = !this.fpsInputVisible;
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
  'applicationState',
  'modalService',
  'labeledThingData',
  'labeledThingInFrameData',
  'dataPrefetcher',
];

export default MediaControlsController;

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
   * @param {KeyboardShortcutService} keyboardShortcutService
   */
  constructor($scope,
              labeledThingInFrameGateway,
              labeledThingGateway,
              interpolationService,
              entityIdService,
              logger,
              $q,
              applicationState,
              modalService,
              keyboardShortcutService) {
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
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

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

    this._registerHotkeys();
  }

  /**
   * Set new `startFrameNumber` based once **Bracket open** button is clicked
   */
  handleSetOpenBracketClicked() {
    if (this.mediaControlsDisabled) {
      return;
    }
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
    if (this.mediaControlsDisabled) {
      return;
    }
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
    if (this.selectedPaperShape) {
      const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
      this._applicationState.disableAll();
      this._applicationState.viewer.work();
      this._interpolationService.interpolate('default', this.task, selectedLabeledThing)
        .then(
          () => {
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
          }
        )
        .catch(
          error => {
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
            throw error;
          }
        );
      // @TODO: Inform other parts of the application to reload LabeledThingsInFrame after interpolation is finished
    }
  }

  handleDeleteSelectionClicked() {
    const deleteQuestion = this._modalService.getWarningDialog({
      title: 'Remove shape',
      headline: 'The selected shape is going to be removed. Proceed?',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }, () => {
      this._deleteSelectedShape();
    });
    deleteQuestion.activate();
  }

  _deleteSelectedShape() {
    const selectedLabeledThingInFrame = this.selectedPaperShape.labeledThingInFrame;
    const selectedLabeledThing = selectedLabeledThingInFrame.labeledThing;

    const onDeletionError = () => {
      this._applicationState.enableAll();
      const errorDialog = this._modalService.getAlertWarningDialog({
        title: 'Error',
        headline: 'There was an error deleting the selected shape. Please reload the page and try again!',
        confirmButtonText: 'Ok',
      }, () => {
      });
      errorDialog.activate();
    };

    this._applicationState.disableAll();

    // TODO: fix the revision error in the backend
    try {
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
        .catch(() => onDeletionError());
    } catch (error) {
      onDeletionError();
    }
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
        this.popupPanelState = '';
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
        this.popupPanelState = '';
        break;
      default:
        this.popupPanelState = 'zoom';
        this.popupPanelOpen = true;
    }
  }

  showGeneralSettings() {
    switch (this.popupPanelState) {
      case 'settings':
        this.popupPanelOpen = !this.popupPanelOpen;
        this.popupPanelState = '';
        break;
      default:
        this.popupPanelState = 'settings';
        this.popupPanelOpen = true;
    }
  }

  handleJumpForwardsClicked() {
    this.framePosition.jumpBy(10);
  }

  handleJumpBackwardsClicked() {
    this.framePosition.jumpBy(-10);
  }

  _registerHotkeys() {
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['j'],
      description: 'Go one frame back',
      callback: this.handlePreviousFrameClicked.bind(this)
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['l'],
      description: 'Go one frame forward',
      callback: this.handleNextFrameClicked.bind(this)
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['shift+j'],
      description: 'Go 10 frames back',
      callback: this.handleJumpBackwardsClicked.bind(this)
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['shift+l'],
      description: 'Go 10 frames forward',
      callback: this.handleJumpForwardsClicked.bind(this)
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['del'],
      description: 'Delete selected object',
      callback: this.handleDeleteSelectionClicked.bind(this)
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'k',
      description: 'Toggle play funktion',
      callback: () => {
        if (this.playing) {
          this.handlePause();
        } else {
          this.handlePlay();
        }
      }
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'i',
      description: 'Interpolate the current selection',
      callback: this.handleInterpolation.bind(this)
    });
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
  'keyboardShortcutService',
];

export default MediaControlsController;

import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';

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
 * @property {boolean} showCrosshairs
 */
class MediaControlsController {
  /**
   * @param {angular.$scope} $scope
   * @param {angular.$rootScope} $rootScope
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
   * @param {InterpolationService} interpolationService
   * @param {EntityIdService} entityIdService
   * @param {LoggerService} logger
   * @param {angular.$q} $q
   * @param {Object} applicationState
   * @param {ModalService} modalService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   * @param featureFlags
   */
  constructor($scope,
              $rootScope,
              labeledThingInFrameGateway,
              labeledThingGateway,
              labeledThingGroupGateway,
              interpolationService,
              entityIdService,
              logger,
              $q,
              applicationState,
              modalService,
              keyboardShortcutService,
              viewerMouseCursorService,
              featureFlags) {
    /**
     * @type {angular.$rootScope}
     */
    this._$rootScope = $rootScope;

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
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;

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
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    this.featureFlags = featureFlags;

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
            this.activeTool = 'multi';
          }
        }
      }
    );

    this._applicationState.$watch('mediaControls.isDisabled', disabled => this.mediaControlsDisabled = disabled);

    this._registerHotkeys();
  }

  /**
   * Set new `startFrameIndex` once **Bracket open** button is clicked
   */
  handleSetOpenBracketClicked() {
    if (this.mediaControlsDisabled) {
      return;
    }
    const framePosition = this.framePosition.position;
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (framePosition > selectedLabeledThing.frameRange.endFrameIndex) {
      return;
    }

    selectedLabeledThing.frameRange.startFrameIndex = framePosition;
    this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
  }

  /**
   * Jump to the `startFrameIndex` of the selected {@link LabeledThing}
   */
  handleGotoOpenBracketClicked() {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    this.framePosition.goto(selectedLabeledThing.frameRange.startFrameIndex);
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
    if (this.bookmarkedFrameIndex) {
      this.framePosition.goto(this.bookmarkedFrameIndex);
    }
  }

  /**
   * Jump to the `endFrameIndex` of the selected {@link LabeledThing}
   */
  handleGotoCloseBracketClicked() {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    this.framePosition.goto(selectedLabeledThing.frameRange.endFrameIndex);
  }

  /**
   * Set new `endFrameIndex` once **Bracket close** button is clicked
   */
  handleSetCloseBracketClicked() {
    if (this.mediaControlsDisabled) {
      return;
    }
    const framePosition = this.framePosition.position;
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (framePosition < selectedLabeledThing.frameRange.startFrameIndex) {
      return;
    }

    selectedLabeledThing.frameRange.endFrameIndex = framePosition;
    this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
  }

  /**
   * Handle the toggle of hiding all non selected {@link LabeledThingInFrame}
   */
  handleHideLabeledThingsInFrameToggle() {
    this.hideLabeledThingsInFrame = !this.hideLabeledThingsInFrame;
  }

  /**
   * Handle the toggle of showing the crosshairs
   */
  handleShowCrosshairsToggle() {
    if (this._viewerMouseCursorService.isCrosshairShowing()) {
      this._viewerMouseCursorService.hideCrosshair();
    } else {
      this._viewerMouseCursorService.showCrosshair();
    }
  }

  /**
   * @returns {boolean}
   */
  isCrosshairShowing() {
    return this._viewerMouseCursorService.isCrosshairShowing();
  }

  /**
   * Handle the creation of new rectangle
   */
  handleNewLabeledThingClicked() {
    this._$rootScope.$emit('action:create-new-default-shape');
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

            this._modalService.info(
              {
                title: 'Interpolation error',
                headline: 'There was an error with the interpolation. Please try again.',
                confirmButtonText: 'Understood',
              },
              undefined,
              undefined,
              {
                warning: true,
                abortable: false,
              }
            );

            throw error;
          }
        );
      // @TODO: Inform other parts of the application to reload LabeledThingsInFrame after interpolation is finished
    }
  }

  handleDeleteSelectionClicked() {
    if (this.selectedPaperShape === null) {
      return;
    }
    this._modalService.info(
      {
        title: 'Remove shape',
        headline: 'The selected shape is going to be removed. Proceed?',
        confirmButtonText: 'Delete',
      },
      () => this._deleteSelectedShape()
    );
  }

  // TODO: Do we need to delete this here? Maybe delegate to some better place...
  _deleteSelectedShape() {
    this._$rootScope.$emit('shape:delete:before', this.selectedPaperShape);

    switch (true) {
      case this.selectedPaperShape instanceof PaperThingShape:
        this._deleteThingShape(this.selectedPaperShape);
        break;
      case this.selectedPaperShape instanceof PaperGroupShape:
        this._deleteGroupShape(this.selectedPaperShape);
        break;
      default:
        throw new Error('Cannot delete shape of unknown type');
    }
  }

  /**
   * @param {PaperThingShape} shape
   * @private
   */
  _deleteThingShape(shape) {
    const selectedLabeledThingInFrame = shape.labeledThingInFrame;
    const selectedLabeledThing = selectedLabeledThingInFrame.labeledThing;

    this._applicationState.disableAll();

    // TODO: fix the revision error in the backend
    try {
      this._labeledThingGateway.deleteLabeledThing(selectedLabeledThing)
        .then(() => {
          shape.remove();
          this.selectedPaperShape = null;
          this.paperThingShapes = this.paperThingShapes.filter(
            paperThingShape => paperThingShape.labeledThingInFrame.id !== selectedLabeledThingInFrame.id
          );

          return selectedLabeledThing;
        })
        .then(() => {
          selectedLabeledThing.groupIds.forEach(groupId => {
            const relatedThingShapes = this.paperThingShapes.filter(thingShape =>
                thingShape.labeledThingInFrame.labeledThing.groupIds.indexOf(groupId) !== -1);
            const shapeGroup = this.paperGroupShapes.find(
                paperGroupShape => paperGroupShape.labeledThingGroupInFrame.labeledThingGroup.id === groupId);

            if (relatedThingShapes.length === 0) {
              return this._deleteGroupShape(shapeGroup);
            }
          });
        })
        .then(() => {
          this._applicationState.enableAll();
          this._$rootScope.$emit('shape:delete:after');
        })
        .catch(() => this._onDeletionError());
    } catch (error) {
      this._onDeletionError();
    }
  }

  /**
   * @param {PaperGroupShape} shape
   * @private
   */
  _deleteGroupShape(shape) {
    const labeledThingGroup = shape.labeledThingGroupInFrame.labeledThingGroup;
    const relatedThingShapes = this.paperThingShapes.filter(
      thingShape => thingShape.labeledThingInFrame.labeledThing.groupIds.indexOf(labeledThingGroup.id) !== -1
    );
    const relatedLabeledThings = relatedThingShapes.map(thingShape => thingShape.labeledThingInFrame.labeledThing);

    this._applicationState.disableAll();

    try {
      this._labeledThingGroupGateway.unassignLabeledThingsToLabeledThingGroup(relatedLabeledThings, labeledThingGroup)
        .then(() => {
          return this._labeledThingGroupGateway.deleteLabeledThingGroup(labeledThingGroup);
        })
        .then(() => {
          shape.remove();
          this.selectedPaperShape = null;
          this.paperGroupShapes = this.paperGroupShapes.filter(
            paperGroupShape => paperGroupShape.labeledThingGroupInFrame.labeledThingGroup.id !== labeledThingGroup.id
          );

          this._applicationState.enableAll();
          this._$rootScope.$emit('shape:delete:after', this.selectedPaperShape);
        })
        .catch(() => this._onDeletionError());
    } catch (error) {
      this._onDeletionError();
    }
  }

  /**
   * @private
   */
  _onDeletionError() {
    this._applicationState.enableAll();
    this._modalService.info(
      {
        title: 'Error',
        headline: 'There was an error deleting the selected shape. Please reload the page and try again!',
      },
      undefined,
      undefined,
      {
        warning: true,
        abortable: false,
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
      callback: this.handlePreviousFrameClicked.bind(this),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['l'],
      description: 'Go one frame forward',
      callback: this.handleNextFrameClicked.bind(this),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['shift+j'],
      description: 'Go 10 frames back',
      callback: this.handleJumpBackwardsClicked.bind(this),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['shift+l'],
      description: 'Go 10 frames forward',
      callback: this.handleJumpForwardsClicked.bind(this),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: ['del'],
      description: 'Delete selected object',
      callback: this.handleDeleteSelectionClicked.bind(this),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'k',
      description: 'Toggle play',
      callback: () => {
        if (this.playing) {
          this.handlePause();
        } else {
          this.handlePlay();
        }
      },
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 't',
      description: 'Interpolate the current selection',
      callback: this.handleInterpolation.bind(this),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'c',
      description: 'Toggle crosshairs',
      callback: () => this.handleShowCrosshairsToggle(),
    });
  }
}

MediaControlsController.$inject = [
  '$scope',
  '$rootScope',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'labeledThingGroupGateway',
  'interpolationService',
  'entityIdService',
  'loggerService',
  '$q',
  'applicationState',
  'modalService',
  'keyboardShortcutService',
  'viewerMouseCursorService',
  'featureFlags',
];

export default MediaControlsController;

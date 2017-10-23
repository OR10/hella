import PaperThingShape from 'Application/Viewer/Shapes/PaperThingShape';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @property {Task} task
 * @property {Video} video
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape} selectedPaperShape
 * @property {string} activeTool
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
   * @param {CutService} cutService
   * @param {ShapeInboxService} shapeInboxService
   * @param {ShapeSelectionService} shapeSelectionService
   */
  constructor(
    $scope,
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
    cutService,
    shapeInboxService,
    shapeSelectionService
  ) {
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

    /**
     * @type {string}
     */
    this.popupPanelState = 'zoom';

    /**
     * @type {boolean}
     */
    this.popupPanelOpen = false;

    this.fpsInputVisible = false;

    /**
     * @type {ShapeInboxService}
     * @private
     */
    this._shapeInboxService = shapeInboxService;

    /**
     * @type {CutService}
     * @private
     */
    this._cutService = cutService;

    /**
     * @type {ShapeSelectionService}
     * @private
     */
    this._shapeSelectionService = shapeSelectionService;

    /**
     * @type {boolean}
     */
    this.currentToolSupportsDefaultShapeCreation = true;

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

    $rootScope.$on('tool:selected:supportsDefaultShapeCreation', (event, supportsDefaultShapeCreation) => {
      this.currentToolSupportsDefaultShapeCreation = supportsDefaultShapeCreation;
    });

    this._applicationState.$watch('mediaControls.isDisabled', disabled => this.mediaControlsDisabled = disabled);

    this._registerHotkeys();
  }

  /**
   * @return {number}
   */
  get selectedItemsCount() {
    return this._shapeInboxService.count();
  }

  /**
   * Whether to show the default shape creation tool or not
   *
   * @returns {boolean}
   */
  showDefaultShapeCreationButton() {
    if (this.readOnly) {
      return false;
    }

    return this.currentToolSupportsDefaultShapeCreation;
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

    this._$rootScope.$emit('action:change-start-frame-index', this.task, this.selectedPaperShape, framePosition);
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
   * Toggles the shape inbox for merging shapes and copying them to other frames
   */
  toggleShapeInbox() {
    switch (this.popupPanelState) {
      case 'inbox':
        this.popupPanelOpen = !this.popupPanelOpen;
        this.popupPanelState = '';
        break;
      default:
        this.popupPanelState = 'inbox';
        this.popupPanelOpen = true;
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

    this._$rootScope.$emit('action:change-end-frame-index', this.task, this.selectedPaperShape, framePosition);
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
      this._applicationState.disableAll();
      this._applicationState.viewer.work();

      const selectedLabeledThingInFrame = this.selectedPaperShape.labeledThingInFrame;
      const selectedLabeledThing = selectedLabeledThingInFrame.labeledThing;

      if (selectedLabeledThingInFrame.ghost === true) {
        selectedLabeledThingInFrame.ghostBust(this._entityIdService.getUniqueId(), selectedLabeledThingInFrame.frameIndex);
      }
      let frameRangeUpdated = false;

      if (selectedLabeledThingInFrame.frameIndex > selectedLabeledThing.frameRange.endFrameIndex) {
        selectedLabeledThing.frameRange.endFrameIndex = selectedLabeledThingInFrame.frameIndex;
        frameRangeUpdated = true;
      }

      if (selectedLabeledThingInFrame.frameIndex < selectedLabeledThing.frameRange.startFrameIndex) {
        selectedLabeledThing.frameRange.startFrameIndex = selectedLabeledThingInFrame.frameIndex;
        frameRangeUpdated = true;
      }

      if (frameRangeUpdated) {
        this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
      }

      this._labeledThingInFrameGateway.saveLabeledThingInFrame(selectedLabeledThingInFrame).then(labeledThingInFrame => {
        this._interpolationService.interpolate(this.task, labeledThingInFrame.labeledThing)
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
      });
    }
  }

  handleDeleteSelectionClicked() {
    if (this.selectedPaperShape === null) {
      return;
    }

    this._$rootScope.$emit('action:ask-and-delete-shape', this.task, this.selectedPaperShape);
  }

  /**
   *
   * @param shape
   * @returns {boolean}
   */
  isPaperThingShape(shape) {
    return shape instanceof PaperThingShape;
  }

  handleCutShape() {
    if (this.selectedPaperShape === null) {
      return;
    }
    const labeledThing = this._shapeSelectionService.getSelectedShape().labeledThingInFrame.labeledThing;
    const labeledThingInFrame = this._shapeSelectionService.getSelectedShape().labeledThingInFrame;

    this._modalService.info(
      {
        title: 'Cut Shape',
        headline: 'Do you really want to cut the shape here?',
        confirmButtonText: 'Yes',
      },
      () => {
        this._applicationState.disableAll();
        this._applicationState.viewer.work();
        this._cutService.cutShape(labeledThing, labeledThingInFrame, this.framePosition.position).then(
          () => {
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
            this._$rootScope.$emit('framerange:change:after');
          })
          .catch(error => {
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
            this._modalService.info(
              {
                title: 'Cutting error',
                headline: error,
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
          });
      },
      undefined,
      {
        warning: false,
        abortable: true,
      }
    );
  }

  handlePlay() {
    this.playing = true;
    this.playbackDirection = 'forwards';
    this.playbackSpeedFactor = 1;
  }

  playButtonVisible() {
    if (!this.playing && (this.selectedPaperShape === null || !this.selectedPaperShape.playInFrameRange())) {
      return true;
    }
    return false;
  }

  playButtonForFrame() {
    if (!this.playing && this.selectedPaperShape !== null && this.selectedPaperShape.playInFrameRange()) {
      return true;
    }
    return false;
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
      callback: () => {
        if (!this.canSelectedPaperShapeBeDeleted()) {
          return;
        }

        this.handleDeleteSelectionClicked();
      },
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
      callback: () => {
        if (!this.canSelectedPaperShapeBeInterpolated()) {
          return;
        }

        this.handleInterpolation();
      },
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'c',
      description: 'Toggle crosshairs',
      callback: () => this.handleShowCrosshairsToggle(),
    });
  }

  /**
   * @return {boolean}
   */
  showOpenCloseBrackets() {
    return !(this.selectedPaperShape === null) && this.selectedPaperShape instanceof PaperThingShape;
  }

  /**
   * @return {boolean}
   */
  canSelectedPaperShapeBeDeleted() {
    return !(this.readOnly === true || this.selectedPaperShape === null) && this.selectedPaperShape.canBeDeleted();
  }

  /**
   * @return {boolean}
   */
  canSelectedPaperShapeBeInterpolated() {
    const isReadOnly = this.readOnly === true;
    const shapeIsSelected = this.selectedPaperShape !== null;
    const saysItCanBeInterpolated = shapeIsSelected && this.selectedPaperShape.canBeInterpolated();

    return (
      !isReadOnly &&
      shapeIsSelected &&
      saysItCanBeInterpolated
    );
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
  'cutService',
  'shapeInboxService',
  'shapeSelectionService',
];

export default MediaControlsController;

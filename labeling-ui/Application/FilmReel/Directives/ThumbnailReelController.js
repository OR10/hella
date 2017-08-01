import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';
import PaperFrame from '../../Viewer/Shapes/PaperFrame';
import PaperMeasurementRectangle from '../../Viewer/Shapes/PaperMeasurementRectangle';

/**
 * Controller of the {@link ThumbnailReelDirective}
 *
 * @property {FramePosition} framePosition
 * @property {Task} task
 * @property {Filters} filters
 * @property {PaperShape} selectedPaperShape
 */
class ThumbnailReelController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {window} $window
   * @param {HTMLElement} $element
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {FrameLocationGateway} frameLocationGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {AnimationFrameService} animationFrameService
   * @param {Object} applicationState
   * @param {LockService} lockService
   * @param {FrameIndexService} frameIndexService
   * @param {LabeledThingGroupService} labeledThingGroupService
   */
  constructor($scope,
              $rootScope,
              $window,
              $element,
              $q,
              abortablePromiseFactory,
              frameLocationGateway,
              labeledThingInFrameGateway,
              labeledThingGateway,
              animationFrameService,
              applicationState,
              lockService,
              frameIndexService,
              labeledThingGroupService) {
    /**
     * @type {Array.<{location: FrameLocation|null, labeledThingInFrame: labeledThingInFrame|null}>}
     */
    this.thumbnails = [];

    /**
     * Dimensions each thumbnail is allowed to consume
     *
     * @type {{width: int, height: int}}
     */
    this.thumbnailDimensions = {width: 0, height: 0};

    /**
     * @type {boolean}
     */
    this.thumbnailsWorking = false;

    /**
     * @type {boolean}
     */
    this.thumbnailsDisabled = false;

    /**
     * @type {ApplicationState}
     * @private
     */
    this._applicationState = applicationState;

    /**
     * @type {LockService}
     * @private
     */
    this._lockService = lockService;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * @type {LabeledThingGroupService}
     * @private
     */
    this._labeledThingGroupService = labeledThingGroupService;

    /**
     * Count of thumbnails shown on the page
     *
     * @type {null}
     */
    this.thumbnailCount = null;

    /**
     * Number of frames to display both before and after the current frame
     *
     * @type {number}
     * @private
     */
    this._thumbnailLookahead = null;

    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['thumbnail'];

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {HTMLElement}
     * @private
     */
    this._$element = $element;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {FrameLocationGateway}
     * @private
     */
    this._frameLocationGateway = frameLocationGateway;

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
     * @type {AbortablePromiseRingBuffer}
     */
    this._frameLocationsBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledThingInFrameBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {boolean}
     */
    this.freezeThumbnails = true;

    this._recalculateViewSizeDebounced = animationFrameService.debounce(() => this._recalculateViewSize());

    const onWindowResized = () => {
      this._recalculateViewSizeDebounced();
    };

    $window.addEventListener('resize', onWindowResized);
    $scope.$on('$destroy', () => {
      $window.removeEventListener('resize', onWindowResized);
    });

    this._recalculateViewSizeDebounced();

    this.prefetchThumbnailLocations();

    this._applicationState.$watch('thumbnails.isDisabled', disabled => this.thumbnailsDisabled = disabled);
    this._applicationState.$watch('thumbnails.isWorking', working => this.thumbnailsWorking = working);

    // Update thumbnails on frame and/or selection change change
    $scope.$watch('vm.framePosition.position', () => {
      // Pause updating during playback
      if (this.playing && this.freezeThumbnails) {
        return;
      }

      this._updateThumbnailData();
    });

    // Update Thumbnails after playing stopped.
    $scope.$watch('vm.playing', (playingNow, playingBefore) => {
      if (this.freezeThumbnails && playingNow) {
        this._applicationState.thumbnails.disable();
      } else {
        if (playingBefore) {
          this._applicationState.thumbnails.enable();
          this._updateThumbnailData();
          if (this.selectedPaperShape !== null) {
            switch (true) {
              case this.selectedPaperShape instanceof PaperThingShape:
                this._updateLabeledThingInFrames(this.selectedPaperShape);
                break;
              case this.selectedPaperShape instanceof PaperGroupShape:
                this._updateLabeledThingGroupsInFrame(this.selectedPaperShape);
                break;
              case this.selectedPaperShape instanceof PaperFrame:
                this._updateLabeledFrame(this.selectedPaperShape);
                break;
              default:
                throw new Error('Cannot update thumbnails for unknown shape type');
            }
          }
        }
      }
    });

    // @TODO: Only supports single shaped LabeledThingInFrames at the moment.
    //        Some sort of watchGroupCollection would be needed to fix this.
    $scope.$watch('vm.selectedPaperShape', newPaperShape => this._paperShapeUpdated(newPaperShape));
    $rootScope.$on('shape:add:after', (event, newPaperShape) => this._paperShapeUpdated(newPaperShape));

    this.handleDrop = this.handleDrop.bind(this);
    this.onBracketDragStart = this.onBracketDragStart.bind(this);
    this.onBracketDragStop = this.onBracketDragStop.bind(this);
  }

  /**
   * Callback when the shape has changed. Possible reasons: Selected Paper Shape has changed or new shape
   * has been created
   *
   * @param newPaperShape
   * @private
   */
  _paperShapeUpdated(newPaperShape) {
    switch (true) {
      case newPaperShape instanceof PaperThingShape:
        this._updateLabeledThingInFrames(newPaperShape);
        break;
      case newPaperShape instanceof PaperGroupShape:
        this._updateLabeledThingGroupsInFrame(newPaperShape);
        break;
      default:
        this._clearThumbnailShapes();
    }
  }

  _recalculateViewSize() {
    const dimensionFactor = this.video.metaData.width / this.video.metaData.height;
    const spacerWidth = this._$element.find('.thumbnail-spacer').outerWidth();
    const reelWidth = this._$element.outerWidth();
    const reelHeight = this._$element.outerHeight();

    const thumbnailHeight = reelHeight;
    const thumbnailWidth = thumbnailHeight * dimensionFactor;

    const thumbnailsFitToReel = (reelWidth - spacerWidth) / (thumbnailWidth + spacerWidth);

    this.thumbnailCount = Math.round((thumbnailsFitToReel) / 2) * 2 + 1;

    this._thumbnailLookahead = Math.floor(this.thumbnailCount / 2);

    this.thumbnails = new Array(this.thumbnailCount).fill({location: null, labeledThingInFrame: null});

    switch (true) {
      case this.selectedPaperShape instanceof PaperThingShape:
        this._updateLabeledThingInFrames(this.selectedPaperShape)
          .then(() => this._updateThumbnailData());
        break;
      case this.selectedPaperShape instanceof PaperGroupShape:
        this._updateLabeledThingGroupsInFrame(this.selectedPaperShape)
          .then(() => this._updateThumbnailData());
        break;
      default:
        this._updateThumbnailData();
    }

    this._$scope.$apply(
      () => this.thumbnailDimensions = {width: thumbnailWidth, height: thumbnailHeight}
    );
  }

  /**
   * @param {PaperThingShape} paperThingShape
   * @returns {Promise}
   * @private
   */
  _updateLabeledThingInFrames(paperThingShape) {
    if (!paperThingShape) {
      this._clearThumbnailShapes();
      return Promise.resolve();
    }

    return this._lockService.acquire(paperThingShape.labeledThingInFrame.labeledThing.id, release => {
      this._labeledThingInFrameBuffer.add(this._loadLabeledThingsInFrame(this.framePosition))
        .then(labeledThingsInFrame => {
          labeledThingsInFrame.forEach(
            (labeledThingInFrame, index) => {
              const thumbnail = this.thumbnails[index];
              // TODO: Sometimes thumbnail is undefined
              const location = thumbnail.location;
              this.thumbnails[index] = {location, labeledThingInFrame};
            }
          );
        });
      release();
    });
  }

  /**
   * @private
   */
  _clearThumbnailShapes() {
    // Clear all thumbnail shape previews
    this.thumbnails.forEach(
      (thumbnail, index) => {
        const location = thumbnail.location;
        const labeledThingInFrame = null;
        this.thumbnails[index] = {location, labeledThingInFrame};
      }
    );
  }

  /**
   * @param {PaperGroupShape} paperGroupShape
   * @returns {Promise}
   * @private
   */
  _updateLabeledThingGroupsInFrame() {
    // Clear all thumbnail shape previews
    this.thumbnails.forEach(
      (thumbnail, index) => {
        const location = thumbnail.location;
        const labeledThingInFrame = null;
        this.thumbnails[index] = {location, labeledThingInFrame};
      }
    );
    return Promise.resolve();
  }

  /**
   * @param {PaperFrame} paperFrame
   * @returns {Promise}
   * @private
   */
  _updateLabeledFrame() {
    // Clear all thumbnail shape previews
    this._clearThumbnailShapes();
  }

  /**
   * @private
   */
  _updateThumbnailData() {
    this._frameLocationsBuffer.add(
      this._loadFrameLocations(this.framePosition)
    )
      .then(thumbnailLocations =>
        thumbnailLocations.forEach(
          (location, index) => {
            const thumbnail = this.thumbnails[index];
            if (thumbnail) {
              const labeledThingInFrame = thumbnail.labeledThingInFrame;
              this.thumbnails[index] = {location, labeledThingInFrame};
            }
          }
        )
      );
  }

  /**
   * Calculate needed lower and upper request bounds to fetch all the needed frames based on the current `framePosition`
   *
   * @param {FramePosition} framePosition
   * @returns {{lowerLimit: integer, upperLimit: integer}}
   * @private
   */
  _calculateLowerAndUpperLimitByPosition(framePosition) {
    const currentFrameIndex = framePosition.position;
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    const thumbnailBeforeCount = this._thumbnailLookahead;
    const thumbnailAfterCount = this._thumbnailLookahead;

    const lowerLimit = Math.max(frameIndexLimits.lowerLimit, currentFrameIndex - thumbnailBeforeCount);
    const upperLimit = Math.min(frameIndexLimits.upperLimit, currentFrameIndex + thumbnailAfterCount);

    return {
      lowerLimit,
      upperLimit,
      count: Math.abs(upperLimit - lowerLimit) + 1,
    };
  }

  /**
   * Correctly fill up the positional array based on the current `framePosition` and the `lowerLimit`
   *
   * @param {FramePosition} framePosition
   * @param {int} lowerLimit
   * @param {Array.<*>} results
   * @private
   */
  _fillPositionalArrayWithResults(framePosition, lowerLimit, results) {
    const currentFrameIndex = framePosition.position;
    const thumbnailBeforeCount = this._thumbnailLookahead;

    const positionalArray = new Array(this.thumbnailCount).fill(null);

    const startIndex = lowerLimit - currentFrameIndex + thumbnailBeforeCount;

    results.forEach(
      (result, index) => positionalArray[startIndex + index] = result
    );

    return positionalArray;
  }

  /**
   * Load all the needed thumbnail {@link FrameLocation}s to display them around
   * the current {@link FramePosition}
   *
   * @param {FramePosition} framePosition
   * @returns {AbortablePromise<Array<FrameLocation|null>>}
   * @private
   */
  _loadFrameLocations(framePosition) {
    const imageTypes = this.task.requiredImageTypes.filter(imageType => {
      return (this._supportedImageTypes.indexOf(imageType) !== -1);
    });
    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }

    const {lowerLimit, count} = this._calculateLowerAndUpperLimitByPosition(framePosition);
    return this._frameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], lowerLimit, count)
      .then(locations => this._fillPositionalArrayWithResults(framePosition, lowerLimit, locations));
  }

  /**
   * Load all {@link PaperShape} elements which are associated with the
   * currently selected {@link PaperShape}.
   *
   * Those {@link PaperShape} objects are used by the underlying {@link ThumbnailDirective}s to
   * display appropriate shapes.
   *
   * @param framePosition
   * @return {AbortablePromise}
   * @private
   */
  _loadLabeledThingsInFrame(framePosition) {
    // TODO: load labeledThingGroups for thumbnails
    // Currently Do not load shapes if paperGroup is selected
    if (this.selectedPaperShape instanceof PaperGroupShape) {
      return this._abortablePromiseFactory(this._$q.resolve(new Array(this.thumbnailCount).fill(null)));
    }

    if (!this.selectedPaperShape) {
      return this._abortablePromiseFactory(this._$q.resolve(new Array(this.thumbnailCount).fill(null)));
    }

    const {lowerLimit, count} = this._calculateLowerAndUpperLimitByPosition(framePosition);
    return this._labeledThingInFrameGateway.getLabeledThingInFrame(
      this.task,
      lowerLimit,
      this.selectedPaperShape.labeledThingInFrame.labeledThing,
      0,
      count
    ).then(
      labeledThingInFrames => this._fillPositionalArrayWithResults(framePosition, lowerLimit, labeledThingInFrames)
    );
  }

  isCurrentThumbnail(index) {
    return (this.thumbnailCount - 1) / index === 2;
  }

  thumbnailSpacerInFrameRange(index) {
    if (!this.selectedPaperShape) {
      return false;
    }

    const currentFramePosition = this.framePosition.position - this._thumbnailLookahead + index;

    const frameRange = this._getFrameRange();

    // Start frame brackets are placed in a spacer element "before" the actual frame so an offset of 1 is required here
    return currentFramePosition + 1 > frameRange.startFrameIndex
      && currentFramePosition < frameRange.endFrameIndex;
  }

  thumbnailInFrameRange(index) {
    if (!this.selectedPaperShape || index < 0) {
      return false;
    }

    const thumbnail = this.thumbnails[index];

    if (thumbnail.location === null) {
      return false;
    }

    const frameRange = this._getFrameRange();

    return frameRange.startFrameIndex <= thumbnail.location.frameIndex
      && frameRange.endFrameIndex >= thumbnail.location.frameIndex;
  }

  placeStartBracket(index) {
    if (!this.selectedPaperShape) {
      return false;
    }

    const startFrameIndex = this._getFrameRange().startFrameIndex;

    if (index < 0) {
      return startFrameIndex === this.framePosition.position - this._thumbnailLookahead;
    }

    const thumbnail = this.thumbnails[index + 1];

    return thumbnail && thumbnail.location && thumbnail.location.frameIndex === startFrameIndex;
  }

  placeEndBracket(index) {
    if (!this.selectedPaperShape || index < 0) {
      return false;
    }

    const endFrameIndex = this._getFrameRange().endFrameIndex;
    const thumbnail = this.thumbnails[index];

    return thumbnail.location && thumbnail.location.frameIndex === endFrameIndex;
  }

  /**
   * @return {FrameRange}
   * @private
   */
  _getFrameRange() {
    let frameRange;
    switch (true) {
      case this.selectedPaperShape instanceof PaperThingShape:
        frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;
        break;
      case this.selectedPaperShape instanceof PaperGroupShape:
        frameRange = this._labeledThingGroupService.getFrameRangeFromShapesForGroup(this.paperThingShapes, this.selectedPaperShape, this.framePosition.position);
        break;
      case this.selectedPaperShape instanceof PaperFrame:
      case this.selectedPaperShape instanceof PaperMeasurementRectangle:
        frameRange = {
          startFrameIndex: 0,
          endFrameIndex: this.task.frameNumberMapping.length - 1,
        };
        break;
      default:
        throw new Error('Cannot get frame range of unknown shape type');
    }

    return frameRange;
  }

  /**
   * Update the start frame index for the currently selected thing
   *
   * @param index
   * @private
   */
  _setStartFrameIndex(index) {
    if (this.selectedPaperShape instanceof PaperGroupShape) {
      throw new Error('Cannot change the frame range of groups!');
    }

    const frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;

    if (this.thumbnails[index + 1] && this.thumbnails[index + 1].location !== null) {
      const frameIndex = this.thumbnails[index + 1].location.frameIndex;

      if (frameIndex <= frameRange.endFrameIndex) {
        const oldStartFrameIndex = frameRange.startFrameIndex;

        frameRange.startFrameIndex = frameIndex;

        // Synchronize operations on this LabeledThing
        this._labeledThingGateway.saveLabeledThing(this.selectedPaperShape.labeledThingInFrame.labeledThing).then(() => {
          // If the frame range narrowed we might have deleted shapes, so we need to refresh our thumbnails
          if (frameIndex > oldStartFrameIndex) {
            this._updateLabeledThingInFrames(this.selectedPaperShape);
            this._$scope.$root.$emit('framerange:change:after');
          }
        });
      }
    }
  }

  /**
   * Update the end frame index for the currently selected thing
   *
   * @param index
   * @private
   */
  _setEndFrameIndex(index) {
    if (this.selectedPaperShape instanceof PaperGroupShape) {
      throw new Error('Cannot change the frame range of groups!');
    }

    const frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;

    if (this.thumbnails[index] && this.thumbnails[index].location !== null) {
      const frameIndex = this.thumbnails[index].location.frameIndex;

      if (frameIndex >= frameRange.startFrameIndex) {
        const oldEndFrameIndex = frameRange.endFrameIndex;

        frameRange.endFrameIndex = frameIndex;

        this._labeledThingGateway.saveLabeledThing(this.selectedPaperShape.labeledThingInFrame.labeledThing).then(() => {
          // If the frame range narrowed we might have deleted shapes, so we need to refresh our thumbnails
          if (frameIndex < oldEndFrameIndex) {
            this._updateLabeledThingInFrames(this.selectedPaperShape);
            this._$scope.$root.$emit('framerange:change:after');
          }
        });
      }
    }
  }

  handleDrop(event, dragObject, index) {
    if (dragObject.draggable.hasClass('start-bracket')) {
      this._setStartFrameIndex(index);
      return;
    }

    this._setEndFrameIndex(index);
  }

  placeBracketSpacer(index) {
    const currentFramePosition = this.framePosition.position - this._thumbnailLookahead + index;
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();

    // Start frame brackets are placed in a spacer element "before" the actual frame so an offset of 1 is required here
    return currentFramePosition + 1 >= frameIndexLimits.lowerLimit
      && currentFramePosition <= frameIndexLimits.upperLimit;
  }

  onBracketDragStart() {
    this._$element.css({cursor: 'col-resize'});
  }

  onBracketDragStop() {
    this._$element.css({cursor: 'auto'});
  }

  prefetchThumbnailLocations() {
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    const frameCount = frameIndexLimits.upperLimit - frameIndexLimits.lowerLimit + 1;

    // After this call the locations should be inside their respective cache
    this._frameLocationGateway.getFrameLocations(this.task.id, 'thumbnail', 0, frameCount);
  }

  /**
   * @return {boolean}
   */
  canPerformModifications() {
    return !(this.readOnly === true) && this.selectedPaperShape instanceof PaperThingShape;
  }
}

ThumbnailReelController.$inject = [
  '$scope',
  '$rootScope',
  '$window',
  '$element',
  '$q',
  'abortablePromiseFactory',
  'frameLocationGateway',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'animationFrameService',
  'applicationState',
  'lockService',
  'frameIndexService',
  'labeledThingGroupService',
];

export default ThumbnailReelController;

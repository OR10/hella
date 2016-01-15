import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

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
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {AnimationFrameService} animationFrameService
   * @param {Object} applicationState
   * @param {LockService} lockService
   */
  constructor($scope, $window, $element, $q, abortablePromiseFactory, taskFrameLocationGateway, labeledThingInFrameGateway, labeledThingGateway, animationFrameService, applicationState, lockService) {
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
    this.showLoadingSpinner = false;

    /**
     * @type {boolean}
     */
    this.showLoadingMask = false;

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
     * Count of thumbnails shown on the page
     *
     * @type {null}
     */
    this._thumbnailCount = null;

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
     * @type {TaskFrameLocationGateway}
     * @private
     */
    this._taskFrameLocationGateway = taskFrameLocationGateway;

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

    this._recalculateViewSizeDebounced();

    this.prefetchThumbnailLocations();

    $window.addEventListener('resize', onWindowResized);
    $scope.$on('$destroy', () => {
      $window.removeEventListener('resize', onWindowResized);
    });

    this._applicationState.$watch('thumbnails.disabled', disabled => this.showLoadingMask = disabled);

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
        this.showLoadingMask = true;
      } else {
        if (this._applicationState.thumbnails.disabled !== true) {
          this.showLoadingMask = false;
        }

        if (playingBefore) {
          this._updateThumbnailData();
          if (this.selectedPaperShape !== null) {
            this._updateLabeledThingInFrames(this.selectedPaperShape);
          }
        }
      }
    });

    // @TODO: Only supports single shaped LabeledThingInFrames at the moment.
    //        Some sort of watchGroupCollection would be needed to fix this.
    $scope.$watchGroup(['vm.selectedPaperShape', 'vm.selectedPaperShape.isDraft', 'vm.selectedPaperShape.labeledThingInFrame.shapes[0]'],
      ([newPaperShape]) => this._updateLabeledThingInFrames(newPaperShape)
    );

    this.handleDrop = this.handleDrop.bind(this);
    this.onBracketDragStart = this.onBracketDragStart.bind(this);
    this.onBracketDragStop = this.onBracketDragStop.bind(this);
  }

  _recalculateViewSize() {
    const dimensionFactor = this.video.metaData.width / this.video.metaData.height;
    const spacerWidth = this._$element.find('.thumbnail-spacer').outerWidth();
    const reelWidth = this._$element.outerWidth();
    const reelHeight = this._$element.outerHeight();

    const thumbnailHeight = reelHeight;
    const thumbnailWidth = thumbnailHeight * dimensionFactor;

    const thumbnailsFitToReel = (reelWidth - spacerWidth) / (thumbnailWidth + spacerWidth);

    this._thumbnailCount = Math.round((thumbnailsFitToReel) / 2) * 2 + 1;

    this._thumbnailLookahead = Math.floor(this._thumbnailCount / 2);

    this.thumbnails = new Array(this._thumbnailCount).fill({location: null, labeledThingInFrame: null});
    this._updateLabeledThingInFrames(this.selectedPaperShape)
      .then(() => this._updateThumbnailData());

    this._$scope.$apply(
      () => this.thumbnailDimensions = {width: thumbnailWidth, height: thumbnailHeight}
    );
  }

  /**
   * @param newPaperShape
   * @returns {Promise}
   * @private
   */
  _updateLabeledThingInFrames(newPaperShape) {
    if (!newPaperShape || newPaperShape.isDraft) {
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

    return this._lockService.acquire(newPaperShape.labeledThingInFrame.labeledThing.id, release => {
      release();
      this._labeledThingInFrameBuffer.add(this._loadLabeledThingsInFrame(this.framePosition))
        .then(labeledThingsInFrame => {
          labeledThingsInFrame.forEach(
            (labeledThingInFrame, index) => {
              const thumbnail = this.thumbnails[index];
              const location = thumbnail.location;
              this.thumbnails[index] = {location, labeledThingInFrame};
            }
          );
        });
    });
  }

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
   * Calculate needed `offset` and `limit` parameters to fetch all the $frameCount frames based on the current `framePosition`
   *
   * @param {FramePosition} framePosition
   * @returns {{offset: number, limit: number}}
   * @private
   */
  _calculateOffsetAndLimitByPosition(framePosition) {
    const relativeFrameNumber = framePosition.position - this.task.frameRange.startFrameNumber;
    const relativeEndFrameNumber = framePosition.endFrameNumber - this.task.frameRange.startFrameNumber + 1;

    const offset = Math.max(0, relativeFrameNumber - this._thumbnailLookahead);
    const limit = Math.min(relativeEndFrameNumber, relativeFrameNumber + this._thumbnailLookahead) - offset;

    return {offset, limit};
  }

  /**
   * Correctly fill up the positional array based on the current `framePosition` and the `offset`
   *
   * @param {FramePosition} framePosition
   * @param {int} offset
   * @param {Array.<*>} results
   * @private
   */
  _fillPositionalArrayWithResults(framePosition, offset, results) {
    const positionalArray = new Array(this._thumbnailCount).fill(null);
    const startIndex = offset - (framePosition.position - this.task.frameRange.startFrameNumber) + this._thumbnailLookahead;

    results.forEach((result, index) => positionalArray[startIndex + index] = result);

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
    const imageTypes = this.task.requiredImageTypes.filter((imageType) => {
      return (this._supportedImageTypes.indexOf(imageType) !== -1);
    });
    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }

    const {offset, limit} = this._calculateOffsetAndLimitByPosition(framePosition);
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], offset, limit)
      .then(locations => this._fillPositionalArrayWithResults(framePosition, offset, locations));
  }

  /**
   * Load all {@link LabeledThingInFrame} elements which are associated with the
   * currently selected {@link LabeledThing}.
   *
   * Those {@link LabeledThingInFrame} objects are used by the underlying {@link ThumbnailDirective}s to
   * display appropriate shapes.
   *
   * @param framePosition
   * @private
   */
  _loadLabeledThingsInFrame(framePosition) {
    if (!this.selectedPaperShape) {
      return this._abortablePromiseFactory(this._$q.resolve(new Array(this._thumbnailCount).fill(null)));
    }

    const {offset, limit} = this._calculateOffsetAndLimitByPosition(framePosition);
    return this._labeledThingInFrameGateway.getLabeledThingInFrame(
      this.task,
        offset + 1,
      this.selectedPaperShape.labeledThingInFrame.labeledThing,
      0,
      limit
      )
      .then(labeledThingInFrames => this._fillPositionalArrayWithResults(framePosition, offset, labeledThingInFrames));
  }

  isCurrentThumbnail(index) {
    return (this._thumbnailCount - 1) / index === 2;
  }

  thumbnailSpacerInFrameRange(index) {
    if (!this.selectedPaperShape) {
      return false;
    }

    const currentFramePosition = this.framePosition.position - this._thumbnailLookahead + index;
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    // Start frame brackets are placed in a spacer element "before" the actual frame so an offset of 1 is required here
    return currentFramePosition + 1 > selectedLabeledThing.frameRange.startFrameNumber
      && currentFramePosition < selectedLabeledThing.frameRange.endFrameNumber;
  }

  thumbnailInFrameRange(index) {
    if (!this.selectedPaperShape || index < 0) {
      return false;
    }

    const thumbnail = this.thumbnails[index];

    if (thumbnail.location === null) {
      return false;
    }

    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;
    return selectedLabeledThing.frameRange.startFrameNumber <= thumbnail.location.frameNumber
      && selectedLabeledThing.frameRange.endFrameNumber >= thumbnail.location.frameNumber;
  }

  placeStartBracket(index) {
    if (!this.selectedPaperShape) {
      return false;
    }

    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (index < 0) {
      return selectedLabeledThing.frameRange.startFrameNumber === this.framePosition.position - this._thumbnailLookahead;
    }

    const thumbnail = this.thumbnails[index + 1];

    return thumbnail && thumbnail.location && thumbnail.location.frameNumber === selectedLabeledThing.frameRange.startFrameNumber;
  }

  placeEndBracket(index) {
    if (!this.selectedPaperShape || index < 0) {
      return false;
    }

    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    const thumbnail = this.thumbnails[index];

    return thumbnail.location && thumbnail.location.frameNumber === selectedLabeledThing.frameRange.endFrameNumber;
  }

  /**
   * Update the start frame number for the currently selected thing
   *
   * @param index
   * @private
   */
  _setStartFrameNumber(index) {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (this.thumbnails[index + 1] && this.thumbnails[index + 1].location !== null) {
      const frameNumber = this.thumbnails[index + 1].location.frameNumber;

      if (frameNumber <= selectedLabeledThing.frameRange.endFrameNumber) {
        const oldStartFrameNumber = selectedLabeledThing.frameRange.startFrameNumber;

        selectedLabeledThing.frameRange.startFrameNumber = frameNumber;

        // Synchronize operations on this LabeledThing
        this._lockService.acquire(selectedLabeledThing.id, release =>{
          this._labeledThingGateway.saveLabeledThing(selectedLabeledThing).then(() => {
            release();
            // If the frame range narrowed we might have deleted shapes, so we need to refresh our thumbnails
            if (frameNumber > oldStartFrameNumber) {
              this._updateLabeledThingInFrames(this.selectedPaperShape);
            }
          });
        });
      }
    }
  }

  /**
   * Update the end frame number for the currently selected thing
   *
   * @param index
   * @private
   */
  _setEndFrameNumber(index) {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (this.thumbnails[index] && this.thumbnails[index].location !== null) {
      const frameNumber = this.thumbnails[index].location.frameNumber;

      if (frameNumber >= selectedLabeledThing.frameRange.startFrameNumber) {
        const oldEndFrameNumber = selectedLabeledThing.frameRange.endFrameNumber;

        selectedLabeledThing.frameRange.endFrameNumber = frameNumber;

        this._labeledThingGateway.saveLabeledThing(selectedLabeledThing).then(() => {
          // If the frame range narrowed we might have deleted shapes, so we need to refresh our thumbnails
          if (frameNumber < oldEndFrameNumber) {
            this._updateLabeledThingInFrames(this.selectedPaperShape);
          }
        });
      }
    }
  }

  handleDrop(event, dragObject, index) {
    if (dragObject.draggable.hasClass('start-bracket')) {
      this._setStartFrameNumber(index);
      return;
    }

    this._setEndFrameNumber(index);
  }

  placeBracketSpacer(index) {
    const currentFramePosition = this.framePosition.position - this._thumbnailLookahead + index;

    // Start frame brackets are placed in a spacer element "before" the actual frame so an offset of 1 is required here
    return currentFramePosition + 1 >= this.framePosition.startFrameNumber
      && currentFramePosition <= this.framePosition.endFrameNumber;
  }

  onBracketDragStart() {
    this._$element.css({cursor: 'col-resize'});
  }

  onBracketDragStop() {
    this._$element.css({cursor: 'auto'});
  }

  prefetchThumbnailLocations() {
    const frameCount = this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber + 1;
    this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'thumbnail', 0, frameCount);
  }
}

ThumbnailReelController.$inject = [
  '$scope',
  '$window',
  '$element',
  '$q',
  'abortablePromiseFactory',
  'taskFrameLocationGateway',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'animationFrameService',
  'applicationState',
  'lockService',
];

export default ThumbnailReelController;

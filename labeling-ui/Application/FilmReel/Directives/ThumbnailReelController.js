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
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   */
  constructor($scope, $q, abortablePromiseFactory, taskFrameLocationGateway, labeledThingInFrameGateway, labeledThingGateway) {
    /**
     * @type {Array.<{location: FrameLocation|null, labeledThingInFrame: labeledThingInFrame|null}>}
     */
    this.thumbnails = new Array(7).fill().map(() => ({location: null, labeledThingInFrame: null}));

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
     * Number of frames to display both before and after the current frame
     *
     * @type {number}
     * @private
     */
    this._thumbnailLookahead = 3;

    // Update thumbnails on frame and/or selection change change
    $scope.$watch('vm.framePosition.position', () => {
      // Pause updating during playback
      if (this.playing) {
        return;
      }

      this._updateThumbnailData();
    });

    // Update Thumbnails after playing stopped.
    $scope.$watch('vm.playing', (playingNow, playingBefore) => {
      if (playingBefore) {
        this._updateThumbnailData();
        if (this.selectedPaperShape !== null) {
          this._updateLabeledThingInFrames(this.selectedPaperShape);
        }
      }
    });

    // @TODO: Only supports single shaped LabeledThingInFrames at the moment.
    //        Some sort of watchGroupCollection would be needed to fix this.
    $scope.$watchGroup(['vm.selectedPaperShape', 'vm.selectedPaperShape.isDraft', 'vm.selectedPaperShape.labeledThingInFrame.shapes[0]'],
      ([newPaperShape]) => this._updateLabeledThingInFrames(newPaperShape)
    );

    this.handleDrop = this.handleDrop.bind(this);
  }

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
      return;
    }

    this._labeledThingInFrameBuffer.add(
      this._loadLabeledThingsInFrame(this.framePosition)
      )
      .then(labeledThingsInFrame => {
        labeledThingsInFrame.forEach(
          (labeledThingInFrame, index) => {
            const thumbnail = this.thumbnails[index];
            const location = thumbnail.location;
            this.thumbnails[index] = {location, labeledThingInFrame};
          }
        );
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
            const labeledThingInFrame = thumbnail.labeledThingInFrame;
            this.thumbnails[index] = {location, labeledThingInFrame};
          }
        )
      );
  }

  /**
   * Calculate needed `offset` and `limit` parameters to fetch all the 7 frames based on the current `framePosition`
   *
   * @param {FramePosition} framePosition
   * @returns {{offset: number, limit: number}}
   * @private
   */
  _calculateOffsetAndLimitByPosition(framePosition) {
    const offset = Math.max(0, (framePosition.position - 1) - this._thumbnailLookahead);
    const limit = Math.min(framePosition.endFrameNumber, framePosition.position + this._thumbnailLookahead) - offset;
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
    const positionalArray = new Array(7).fill(null);
    const startIndex = offset - (framePosition.position - 1) + 3;
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
      return this._abortablePromiseFactory(this._$q.resolve(new Array(7).fill(null)));
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

  _setStartFrameNumber(index) {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (this.thumbnails[index + 1] && this.thumbnails[index + 1].location !== null) {
      const frameNumber = this.thumbnails[index + 1].location.frameNumber;

      if (frameNumber <= selectedLabeledThing.frameRange.endFrameNumber) {
        selectedLabeledThing.frameRange.startFrameNumber = frameNumber;
        this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
      }
    }
  }

  _setEndFrameNumber(index) {
    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    if (this.thumbnails[index] && this.thumbnails[index].location !== null) {
      const frameNumber = this.thumbnails[index].location.frameNumber;

      if (frameNumber >= selectedLabeledThing.frameRange.startFrameNumber) {
        selectedLabeledThing.frameRange.endFrameNumber = frameNumber;
        this._labeledThingGateway.saveLabeledThing(selectedLabeledThing);
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
}

ThumbnailReelController.$inject = [
  '$scope',
  '$q',
  'abortablePromiseFactory',
  'taskFrameLocationGateway',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
];

export default ThumbnailReelController;

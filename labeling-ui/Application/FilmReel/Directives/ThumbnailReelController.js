import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller of the {@link ThumbnailReelDirective}
 *
 * @property {FramePosition} framePosition
 * @property {Task} task
 * @property {Filters} filters
 * @property {LabeledThingInFrame} selectedLabeledThingInFrame
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
     * {@link FrameLocation}s of the thumbnails, which are currently rendered
     * @type {Array.<FrameLocation>}
     */
    this.thumbnailLocations = new Array(7).fill(null);

    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['thumbnail'];

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

    // Update thumbnails on position change
    $scope.$watchGroup(['vm.framePosition.position', 'vm.selectedLabeledThingInFrame'], () => {
      $q.all([
          this._frameLocationsBuffer.add(
            this._loadFrameLocations(this.framePosition)
          ),
          this._labeledThingInFrameBuffer.add(
            this._loadLabeledThingsInFrame(this.framePosition)
          ),
        ])
        .then(([thumbnailLocations, labeledThingsInFrame]) => {
          this.thumbnails = thumbnailLocations.map(
            (location, index) => ({location, labeledThingInFrame: labeledThingsInFrame[index]})
          );
        });
    });

    this.handleDrop = this.handleDrop.bind(this);
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
    if (this.selectedLabeledThingInFrame === null) {
      return this._abortablePromiseFactory(this._$q.resolve(new Array(7).fill(null)));
    }

    const {offset, limit} = this._calculateOffsetAndLimitByPosition(framePosition);
    return this._labeledThingInFrameGateway.getLabeledThingInFrame(
      this.task.id,
      1,
      this.selectedLabeledThingInFrame.labeledThingId,
      offset,
      limit - 1 // @TODO The backend has an off-by-one error here. As soon as this is fixed the -1 needs to be removed
    )
      .then(labeledThingInFrames => this._fillPositionalArrayWithResults(framePosition, offset, labeledThingInFrames));
  }

  thumbnailInFrameRange(index) {
    if (!this.selectedLabeledThing || index < 0) {
      return false;
    }

    const thumbnail = this.thumbnails[index];

    if (thumbnail.location === null) {
      return false;
    }

    return this.selectedLabeledThing.frameRange.startFrameNumber <= thumbnail.location.frameNumber
      && this.selectedLabeledThing.frameRange.endFrameNumber >= thumbnail.location.frameNumber;
  }

  placeStartBracket(index) {
    if (!this.selectedLabeledThing) {
      return false;
    }

    if (index < 0) {
      return this.selectedLabeledThing.frameRange.startFrameNumber === this.framePosition.position - this._thumbnailLookahead;
    }

    const thumbnail = this.thumbnails[index + 1];

    return thumbnail && thumbnail.location && thumbnail.location.frameNumber === this.selectedLabeledThing.frameRange.startFrameNumber;
  }

  placeEndBracket(index) {
    if (!this.selectedLabeledThing || index < 0) {
      return false;
    }

    const thumbnail = this.thumbnails[index];

    return thumbnail.location && thumbnail.location.frameNumber === this.selectedLabeledThing.frameRange.endFrameNumber;
  }

  _setStartFrameNumber(frameNumber) {
    if (frameNumber >= this.selectedLabeledThing.frameRange.startFrameNumber) {
      this.selectedLabeledThing.frameRange.endFrameNumber = frameNumber;
      this._labeledThingGateway.saveLabeledThing(this.selectedLabeledThing);
    }
  }

  _setEndFrameNumber(frameNumber) {
    if (frameNumber >= this.selectedLabeledThing.frameRange.startFrameNumber) {
      this.selectedLabeledThing.frameRange.endFrameNumber = frameNumber;
      this._labeledThingGateway.saveLabeledThing(this.selectedLabeledThing);
    }
  }

  handleDrop(event, dragObject, index) {
    if (this.thumbnails[index].location !== null) {
      const frameNumber = this.thumbnails[index].location.frameNumber;

      if (dragObject.draggable.hasClass('start-bracket')) {
        this._setStartFrameNumber(frameNumber);
        return;
      }

      this._setEndFrameNumber(frameNumber);
    }
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

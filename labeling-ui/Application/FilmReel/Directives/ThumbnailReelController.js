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
   */
  constructor($scope, $q, abortablePromiseFactory, taskFrameLocationGateway, labeledThingInFrameGateway) {
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
     * @type {AbortablePromiseRingBuffer}
     */
    this._frameLocationsBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledThingInFrameBuffer = new AbortablePromiseRingBuffer(1);

    // Update thumbnails on frame and/or selection change change
    $scope.$watch('vm.framePosition.position', () => {
      this._$q.all([
        this._frameLocationsBuffer.add(
          this._loadFrameLocations(this.framePosition)
        ),
        this._labeledThingInFrameBuffer.add(
          this._loadLabeledThingsInFrame(this.framePosition)
        ),
      ])
      .then(([thumbnailLocations, labeledThingsInFrame]) => {
        thumbnailLocations.forEach(
          (location, index) => {
            const labeledThingInFrame = labeledThingsInFrame[index];
            this.thumbnails[index] = {location, labeledThingInFrame};
          }
        );
      });
    });

    $scope.$watchCollection('vm.selectedLabeledThingInFrame.shapes', (newShapes) => {
      if (!newShapes) {
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
    });
  }

  /**
   * Calculate needed `offset` and `limit` parameters to fetch all the 7 frames based on the current `framePosition`
   *
   * @param {FramePosition} framePosition
   * @returns {{offset: number, limit: number}}
   * @private
   */
  _calculateOffsetAndLimitByPosition(framePosition) {
    const offset = Math.max(0, (framePosition.position - 1) - 3 );
    const limit = Math.min(framePosition.endFrameNumber, framePosition.position + 3) - offset;
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
    if (!this.selectedLabeledThingInFrame) {
      return this._abortablePromiseFactory(this._$q.resolve(new Array(7).fill(null)));
    }

    const {offset, limit} = this._calculateOffsetAndLimitByPosition(framePosition);
    return this._labeledThingInFrameGateway.getLabeledThingInFrame(
      this.task,
      offset + 1,
      this.selectedLabeledThingInFrame.labeledThingId,
      0,
      limit
    )
    .then(labeledThingInFrames => this._fillPositionalArrayWithResults(framePosition, offset, labeledThingInFrames));
  }
}

ThumbnailReelController.$inject = [
  '$scope',
  '$q',
  'abortablePromiseFactory',
  'taskFrameLocationGateway',
  'labeledThingInFrameGateway',
];

export default ThumbnailReelController;

import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller of the {@link ThumbnailReelDirective}
 *
 * @property {FramePosition} framePosition
 * @property {Task} task
 */
class ThumbnailReelController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   */
  constructor($scope, taskFrameLocationGateway) {
    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['thumbnail'];

    /**
     * {@link FrameLocation}s of the thumbnails, which are currently rendered
     * @type {Array.<FrameLocation>}
     */
    this.thumbnailLocations = new Array(7).fill(null);

    /**
     * @type {TaskFrameLocationGateway}
     * @private
     */
    this._taskFrameLocationGateway = taskFrameLocationGateway;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._ringbuffer = new AbortablePromiseRingBuffer(1);


    $scope.$watch('vm.framePosition.position', () => {
      this._ringbuffer.add(
        this._loadFrameLocations(this.framePosition)
      )
      .then((thumbnailLocations) => this.thumbnailLocations = thumbnailLocations);
    });
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

    const offset = Math.max(0, (framePosition.position - 1) - 3 );
    const limit = Math.min(framePosition.endFrameNumber, framePosition.position + 3) - offset;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], offset, limit)
      .then(locations => {
        const thumbnailLocations = new Array(7).fill(null);
        const startIndex = offset - (framePosition.position - 1) + 3;
        locations.forEach((location, index) => thumbnailLocations[startIndex + index] = location);

        return thumbnailLocations;
      });
  }
}

ThumbnailReelController.$inject = [
  '$scope',
  'taskFrameLocationGateway',
];

export default ThumbnailReelController;

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
   * @param {AbortablePromiseFactory} abortable
   */
  constructor($scope, taskFrameLocationGateway, abortable) {
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
        abortable(this._loadFrameLocations(this.framePosition))
      ).then((thumbnailLocations) => this.thumbnailLocations = thumbnailLocations);
    });
  }

  /**
   * Load all the needed thumbnail {@link FrameLocation}s to display them around
   * the current {@link FramePosition}
   *
   * @param {FramePosition} framePosition
   * @returns {Promise<Array<FrameLocation|null>>}
   * @private
   */
  _loadFrameLocations(framePosition) {
    const offset = Math.max(1, framePosition.position - 3);
    const limit = Math.min(framePosition.endFrameNumber, framePosition.position + 3) - offset + 1;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'thumbnail', offset, limit)
    .then(locations => {
      const thumbnailLocations = new Array(7).fill(null);
      const startIndex = offset - framePosition.position + 3;
      locations.forEach((location, index) => thumbnailLocations[startIndex + index] = location);

      return thumbnailLocations;
    });
  }
}

ThumbnailReelController.$inject = [
  '$scope',
  'taskFrameLocationGateway',
  'abortablePromiseFactory',
];

export default ThumbnailReelController;

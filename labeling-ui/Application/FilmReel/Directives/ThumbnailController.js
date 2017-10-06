import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller managing the display of a single ThumbnailImage
 *
 * @property {FrameLocation} location
 * @property {bool} isCurrent
 * @property {FramePosition} framePosition
 * @property {{width: int, height: int}} labeledThingViewport
 * @property {{width: in, height: int}} dimensions
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {FrameGateway} frameGateway
   * @param {LoggerService} logger
   * @param {FrameIndexService} frameIndexService
   */
  constructor(
    $scope,
    $element,
    frameGateway,
    logger,
    frameIndexService
  ) {
    /**
     * Flag to indicate whether the frame number is shown or not
     *
     * Used by mouseover and mouseleave event handlers
     *
     * @type {bool}
     */
    this.showFrameNumber = false;

    /**
     * @type {int}
     */
    this.currentFrameIndex = this.framePosition.position;

    /**
     * @type {jQuery}
     * @private
     */
    this._$imageContainer = $element.find('.thumbnail-image-container');

    /**
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * The currently displayed background image as `HTMLImageElement`
     *
     * @type {HTMLImageElement}
     * @private
     */
    this._activeBackgroundImage = null;

    /**
     * @type {AbortablePromiseRingBuffer}
     * @private
     */
    this._imageLoadBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {HTMLElement}
     * @private
     */
    this._$element = $element;

    /**
     * Promise representing the state of the latest image request
     *
     * @type {AbortablePromise|null}
     * @private
     */
    this._imagePromise = null;

    $scope.$watch('vm.currentFrameIndex', newFrameIndex => {
      const numericalFrameIndex = Number.parseInt(newFrameIndex, 10);
      this.framePosition.goto(numericalFrameIndex);
      this.currentFrameIndex = this.framePosition.position;
    });

    $scope.$watch('vm.dimensions', newDimensions => {
      const {width, height} = newDimensions;

      logger.groupStart('thumbnail:dimensions', `Thumbnail: vm.dimensions changed`);
      logger.log('thumbnail:dimensions', `new    dimensions: ${width}x${height}`);

      // Original video width and height
      const {width: videoWidth, height: videoHeight} = this.labeledThingViewport;

      const fittedWidth = Math.round(videoWidth / videoHeight * height);
      const fittedHeight = Math.round(videoHeight / videoWidth * width);

      logger.log('thumbnail:dimensions', `fitted dimensions: ${fittedWidth}x${fittedHeight}`);

      const containerWidth = fittedWidth <= width ? fittedWidth : width;
      const containerHeight = fittedWidth <= width ? height : fittedHeight;
      logger.log('thumbnail:dimensions', `new dimensions: ${containerWidth}x${containerHeight}`);

      logger.groupEnd('thumbnail:dimensions');

      this._$imageContainer.attr(
        'style',
        `
          width: ${containerWidth}px;
          height: ${containerHeight}px;
        `
      );
    });

    // Update rendered thumbnail once the location changes
    $scope.$watch('vm.location', newLocation => {
      // If a new location is to loaded any currently running load cycle can be aborted
      if (this._imagePromise) {
        this._imagePromise.abort();
      }

      this._removeBackgroundImage();

      // If no new image is needed, we simply do not add one.
      if (newLocation === null) {
        return;
      }

      this.currentFrameIndex = this.framePosition.position;

      this._imagePromise = this._imageLoadBuffer.add(
        this._frameGateway.getImage(newLocation)
      );

      this._imagePromise.then(
        image => this._setBackroundImage(image)
      );
    });
  }

  /**
   * Handle the click to a thumbnail
   */
  handleThumbnailClick() {
    if (this.location && this.location.frameIndex !== undefined) {
      this.framePosition.goto(this.location.frameIndex);
    }
  }

  /**
   * Provide the template with a proper way to access the frameIndex limits
   *
   * @returns {{lowerLimit: number, upperLimit: number}}
   */
  get frameIndexLimits() {
    return this._frameIndexService.getFrameIndexLimits();
  }

  /**
   * Remove a currently set background image of the thumbnail
   *
   * @private
   */
  _removeBackgroundImage() {
    if (this._activeBackgroundImage !== null) {
      this._$imageContainer.empty();
    }

    this._activeBackgroundImage = null;
  }

  /**
   * Set the given `HTMLImageElement` as new background image
   *
   * @param {HTMLImageElement} image
   * @private
   */
  _setBackroundImage(image) {
    image.setAttribute('width', '100%');
    image.setAttribute('height', '100%');

    this._activeBackgroundImage = image;
    this._$imageContainer.append(image);
  }
}

ThumbnailController.$inject = [
  '$scope',
  '$element',
  'frameGateway',
  'loggerService',
  'frameIndexService',
];

export default ThumbnailController;

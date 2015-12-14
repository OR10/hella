import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller of the {@link PopupPanelDirective}
 */
class PopupPanelController {
  /**
   *
   * @param {$rootScope.Scope} $scope
   * @param {angular.$window} $window
   * @param {angular.$element} $element
   * @param {AnimationFrameService} animationFrameService
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor($scope, $window, $element, animationFrameService, drawingContextService, frameGateway, taskFrameLocationGateway, abortablePromiseFactory) {
    this._minimapContainer = $element.find('.minimap-container');
    this._minimap = $element.find('.minimap');

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
     * @type {AbortablePromiseRingBuffer}
     */
    this._frameLocationsBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    this._activeBackgroundImage = null;

    /**
     * @type {DrawingContext}
     * @private
     */
    this._context = drawingContextService.createContext();
    this._context.setup(this._minimap.get(0));

    this._context.withScope(scope => {
      /**
       * @type {paper.Layer}
       * @private
       */
      this._backgroundLayer = new scope.Layer();

      /**
       * @type {paper.Layer}
       * @private
       */
      this._thingLayer = new scope.Layer();
    });

    this._resizeDebounced = animationFrameService.debounce(() => this._resize());
    this._drawLayerDebounced = animationFrameService.debounce(() => {
      this._drawBackgroundImage();
      this._drawViewportBounds();
    });

    // TODO needs to be called on side element resize as well
    $window.addEventListener('resize', this._resizeDebounced);

    $scope.$on('$destroy', () => {
      $window.removeEventListener('resize', this._resizeDebounced);
    });

    $scope.$watch('vm.popupPanelState', newState => {
      if (newState === 'zoom') {
        this._resizeDebounced();
      }
    });

    $scope.$watch('vm.framePosition.position', () => this._loadBackgroundImage());

    $scope.$watch('vm.viewerViewport.bounds', (newBounds) => {
      if (newBounds) {
        this._drawViewportBounds();
      }
    });

    this._resizeDebounced();
  }

  _loadBackgroundImage() {
    this._frameLocationsBuffer.add(
      this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'source', this.framePosition.position)
        .then(([frameLocation]) => {
          return this._frameGateway.getImage(frameLocation);
        })
        .then(image => {
          this._activeBackgroundImage = image;
          this._drawLayerDebounced();
        })
    );
  }

  _resize() {
    const width = this._minimapContainer.width();
    const height = this._minimapContainer.height();

    // Original video width and height
    const {width: videoWidth, height: videoHeight} = this.video.metaData;

    const fittedWidth = Math.round(videoWidth / videoHeight * height);
    const fittedHeight = Math.round(videoHeight / videoWidth * width);

    const canvasWidth = fittedWidth <= width ? fittedWidth : width;
    const canvasHeight = fittedWidth <= width ? height : fittedHeight;

    this._context.withScope(scope => {
      scope.view.viewSize = new scope.Size(
        canvasWidth, canvasHeight
      );
      this._minimap.css({width: `${canvasWidth}px`, height: `${canvasHeight}px`});

      scope.view.update();
    });

    this._drawLayerDebounced();

    if (this.viewerViewport) {
      this._drawViewportBounds();
    }
  }

  _drawBackgroundImage() {
    const image = this._activeBackgroundImage;

    this._context.withScope(() => {
      this._backgroundLayer.activate();
      this._backgroundLayer.removeChildren();
    });

    if (image === null) {
      return;
    }

    this._context.withScope(scope => {
      const zoom = scope.view.size.width / image.width;
      const imageCenter = new scope.Point(image.width / 2, image.height / 2);

      const rasterImage = new scope.Raster(image, imageCenter);

      this._applyFilters(rasterImage, this.filters);

      this._backgroundLayer.scale(zoom, new scope.Point(0, 0));

      scope.view.update();
    });
  }

  _drawViewportBounds() {
    this._context.withScope(() => {
      this._thingLayer.activate();
      this._thingLayer.removeChildren();
    });

    this._context.withScope(scope => {
      const viewportScaleX = scope.view.viewSize.width / this.video.metaData.width;
      const {topLeft, bottomRight} = this.viewerViewport.bounds;

      this._viewportBoundsRect = new scope.Path.Rectangle({
        topLeft,
        bottomRight,
        strokeColor: '#bedb31',
      });

      this._thingLayer.scale(viewportScaleX, new scope.Point(0, 0));

      scope.view.update();
    });
  }

  /**
   * Apply all given filters to a given RasterImage
   *
   * @param {paper.Raster} rasterImage
   * @param {Filters} filters
   * @private
   */
  _applyFilters(rasterImage, filters) {
    this._context.withScope((scope) => {
      const originalImageData = rasterImage.getImageData(
        new scope.Rectangle(0, 0, rasterImage.width, rasterImage.height)
      );
      const filteredImageData = filters.filters.reduce(
        (imageData, filter) => filter.manipulate(imageData),
        originalImageData
      );
      rasterImage.setImageData(filteredImageData, new scope.Point(0, 0));
    });
  }

  zoomIn() {
    this.viewerViewport.zoomIn(1.5);
  }

  zoomOut() {
    this.viewerViewport.zoomOut(1.5);
  }

  scaleToFit() {
    this.viewerViewport.scaleToFit();
  }
}

PopupPanelController.$inject = [
  '$scope',
  '$window',
  '$element',
  'animationFrameService',
  'drawingContextService',
  'frameGateway',
  'taskFrameLocationGateway',
  'abortablePromiseFactory',
];

export default PopupPanelController;

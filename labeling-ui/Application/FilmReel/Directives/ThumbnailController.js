import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller managing the display of a single ThumbnailImage
 *
 * @property {FrameLocation} location
 * @property {Filters} filters
 * @property {bool} isCurrent
 * @property {FramePosition} framePosition
 * @property {LabeledThingInFrame|null} labeledThingInFrame
 * @property {{width: int, height: int}} labeledThingViewport
 * @property {{width: in, height: int}} dimensions
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {AnimationFrameService} animationFrameService
   * @param {LoggerService} logger
   * @param {FrameIndexService} frameIndexService
   */
  constructor($scope,
              $element,
              paperShapeFactory,
              drawingContextService,
              frameGateway,
              animationFrameService,
              logger,
              frameIndexService) {
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
     * @type {DrawingContext}
     * @private
     */
    this._context = drawingContextService.createContext();

    const $canvas = $element.find('canvas');
    this._context.setup($canvas.get(0));


    /**
     * @type {PaperShapeFactory}
     * @private
     */
    this._paperShapeFactory = paperShapeFactory;

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
    this._frameLocationsBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {HTMLElement}
     * @private
     */
    this._$element = $element;

    /**
     * @type {HTMLElement}
     * @private
     */
    this._frameRangeElement = $element.find('.thumbnail-frame-range');

    /**
     * @type {bool}
     * @private
     */
    this._editMode = false;

    /**
     * Promise representing the state of the latest image request
     *
     * @type {AbortablePromise|null}
     * @private
     */
    this._imagePromise = null;

    this._drawBackgroundLayerDebounced = animationFrameService.debounce(redraw => this._drawBackgroundLayer(redraw));
    this._drawThingLayerDebounced = animationFrameService.debounce(redraw => this._drawThingLayer(redraw));

    $scope.$watch('vm.currentFrameIndex', newFrameIndex => {
      const numericalFrameIndex = Number.parseInt(newFrameIndex, 10);
      this.framePosition.goto(numericalFrameIndex);
      this.currentFrameIndex = this.framePosition.position;
    });

    $scope.$watch('vm.dimensions', newDimensions => {
      const {width, height} = newDimensions;

      logger.groupStart('thumbnail:dimensions', `Thumbnail (${$canvas.attr('id')}): vm.dimensions changed`);
      logger.log('thumbnail:dimensions', `new    dimensions: ${width}x${height}`);

      // Original video width and height
      const {width: videoWidth, height: videoHeight} = this.labeledThingViewport;

      const fittedWidth = Math.round(videoWidth / videoHeight * height);
      const fittedHeight = Math.round(videoHeight / videoWidth * width);

      logger.log('thumbnail:dimensions', `fitted dimensions: ${fittedWidth}x${fittedHeight}`);

      const canvasWidth = fittedWidth <= width ? fittedWidth : width;
      const canvasHeight = fittedWidth <= width ? height : fittedHeight;
      logger.log('thumbnail:dimensions', `canvas dimensions: ${canvasWidth}x${canvasHeight}`);

      logger.groupEnd('thumbnail:dimensions');

      this._context.withScope(scope => {
        scope.view.viewSize = new scope.Size(
          canvasWidth, canvasHeight
        );

        scope.view.update();
      });

      this._drawBackgroundLayerDebounced();
      this._drawThingLayerDebounced();
    });

    // Update rendered thumbnail once the location changes
    $scope.$watch('vm.location', newLocation => {
      if (newLocation === null) {
        this._activeBackgroundImage = null;

        if (this._imagePromise) {
          this._imagePromise.abort();
        }

        this._drawBackgroundLayerDebounced();
        return;
      }

      this.currentFrameIndex = this.framePosition.position;

      this._imagePromise = this._frameLocationsBuffer.add(
        this._frameGateway.getImage(newLocation)
      );

      this._imagePromise.then(image => {
        this._activeBackgroundImage = image;
        this._drawBackgroundLayerDebounced();
      });
    });

    // Update rendered thing layer the labeledThingInFrame changes
    $scope.$watch('vm.labeledThingInFrame', () => {
      this._drawThingLayerDebounced();
    });

    // Update filters upon change
    $scope.$watchCollection('vm.filters.filters', () => this._drawBackgroundLayerDebounced());
  }

  /**
   * Apply all given filters to a given RasterImage
   *
   * @param {paper.Raster} rasterImage
   * @param {Filters} filters
   * @private
   */
  _applyFilters(rasterImage, filters) {
    this._context.withScope(scope => {
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

  /**
   * Draw the currently active Background Image
   *
   * @param {boolean?} redraw
   * @private
   */
  _drawBackgroundLayer(redraw = true) {
    const image = this._activeBackgroundImage;

    this._context.withScope(() => {
      this._backgroundLayer.activate();
      this._backgroundLayer.removeChildren();
    });

    if (image === null) {
      if (redraw) {
        this._context.withScope(scope => scope.view.update());
      }
      return;
    }

    this._context.withScope(scope => {
      const zoom = scope.view.size.width / image.width;

      const rasterImage = new scope.Raster(
        image,
        new scope.Point(image.width / 2, image.height / 2)
      );
      this._applyFilters(rasterImage, this.filters);

      this._backgroundLayer.scale(zoom, new scope.Point(0, 0));

      if (redraw) {
        scope.view.draw();
      }
    });
  }

  /**
   * Draw the {@link LabeledThingInFrame} if one is available
   *
   * The drawing operation correctly scales the {@link LabeledThingInFrame} to properly fit
   * into the thumbnail
   *
   * @param {boolean?} redraw
   *
   * @private
   */
  _drawThingLayer(redraw = true) {
    this._context.withScope(() => {
      this._thingLayer.activate();
      this._thingLayer.removeChildren();
    });

    if (this.labeledThingInFrame === null) {
      if (redraw) {
        this._context.withScope(scope => scope.view.update());
      }
      return;
    }

    this._context.withScope(scope => {
      const viewportScaleX = scope.view.viewSize.width / this.labeledThingViewport.width;

      this.labeledThingInFrame.shapes.forEach(
        shape => this._paperShapeFactory.createPaperThingShape(this.labeledThingInFrame, shape, this.video)
      );

      this._thingLayer.scale(viewportScaleX, new scope.Point(0, 0));

      if (redraw) {
        scope.view.update();
      }
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
}

ThumbnailController.$inject = [
  '$scope',
  '$element',
  'paperShapeFactory',
  'drawingContextService',
  'frameGateway',
  'animationFrameService',
  'loggerService',
  'frameIndexService',
];

export default ThumbnailController;

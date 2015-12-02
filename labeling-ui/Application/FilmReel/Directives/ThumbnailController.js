import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import angular from 'angular';

/**
 * Controller managing the display of a single ThumbnailImage
 *
 * @property {FrameLocation} location
 * @property {Filters} filters
 * @property {int} endFrameNumber
 * @property {bool} showFrameNumberAlways
 * @property {LabeledThingInFrame|null} labeledThingInFrame
 * @property {{width: int, height: int}} labeledThingViewport
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {window} $window
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   */
  constructor($scope, $element, $window, paperShapeFactory, drawingContextService, frameGateway) {
    /**
     * Flag to indicate whether the frame number is shown or not
     *
     * Used by mouseover and mouseleave event handlers
     *
     * @type {bool}
     */
    this.showFrameNumber = false;

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
    this._parentElement = $element.parent().get(0);

    const onWindowResized = () => {
      this._draw();
    };
    angular.element($window).on('resize', onWindowResized);
    $scope.$on('$destroy', () => {
      angular.element($window).off('resize', onWindowResized);
    });

    // Update rendered thumbnail once the location changes
    $scope.$watch('vm.location', newLocation => {
      if (newLocation === null) {
        this._activeBackgroundImage = null;
        this._drawBackgroundLayer();
        return;
      }

      this._frameLocationsBuffer.add(
        this._frameGateway.getImage(newLocation)
      ).then(image => {
        this._activeBackgroundImage = image;
        this._drawBackgroundLayer();
      });
    });

    // Update rendered thing layer the labeledThingInFrame changes
    $scope.$watch('vm.labeledThingInFrame', () => {
      this._drawThingLayer();
    });

    // Update filters upon change
    $scope.$watchCollection('vm.filters.filters', () => this._drawBackgroundLayer());
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

  /**
   * Recalculate the ViewSize based on the available width and the aspect ratio of the supplied image
   *
   * @private
   */
  _recalculateViewSize() {
    const parentElement = this._parentElement;

    this._context.withScope(scope => {
      if (this._activeBackgroundImage === null) {
        scope.view.viewSize = new scope.Size(
          parentElement.clientWidth, 0
        );
      } else {
        const zoom = parentElement.clientWidth / this._activeBackgroundImage.width;
        scope.view.viewSize = new scope.Size(
          parentElement.clientWidth, this._activeBackgroundImage.height * zoom
        );
      }
    });
  }

  /**
   * Redraw the complete Thumbnail
   *
   * @private
   */
  _draw() {
    this._drawBackgroundLayer(false);
    this._drawThingLayer(false);

    this._context.withScope(scope => {
      scope.view.draw();
    });
  }

  /**
   * Draw the currently active Background Image
   *
   * @param {boolean?} redraw
   * @private
   */
  _drawBackgroundLayer(redraw = true) {
    this._recalculateViewSize();

    const image = this._activeBackgroundImage;

    this._context.withScope(() => {
      this._backgroundLayer.activate();
      this._backgroundLayer.removeChildren();
    });

    if (image === null) {
      if (redraw) {
        this._context.withScope(scope => scope.view.draw());
      }
      return;
    }

    this._context.withScope(scope => {
      const zoom = scope.view.viewSize.width / image.width;

      const rasterImage = new scope.Raster(
        image,
        new scope.Point(
          image.width / 2, image.height / 2
        )
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
        this._context.withScope(scope => scope.view.draw());
      }
      return;
    }

    this._context.withScope(scope => {
      const viewportScaleX = scope.view.viewSize.width / this.labeledThingViewport.width;

      this.labeledThingInFrame.shapes.forEach(
        shape => this._paperShapeFactory.createPaperShape(this.labeledThingInFrame, shape)
      );

      this._thingLayer.scale(viewportScaleX, new scope.Point(0, 0));

      if (redraw) {
        scope.view.draw();
      }
    });
  }
}

ThumbnailController.$inject = [
  '$scope',
  '$element',
  '$window',
  'paperShapeFactory',
  'drawingContextService',
  'frameGateway',
];

export default ThumbnailController;

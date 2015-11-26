import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import angular from 'angular';

/**
 * Controller managing the display of a single ThumbnailImage
 *
 * @property {FrameLocation} location
 * @property {Filters} filters
 * @property {int} endFrameNumber
 * @property {bool} showFrameNumberAlways
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {window} $window
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   */
  constructor($scope, $element, $window, drawingContextService, frameGateway) {
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
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    /**
     * @type {paper.Raster|null}
     * @private
     */
    this._rasterImage = null;

    /**
     * The currently displayed background image as `HTMLImageElement`
     *
     * @type {HTMLImageElement}
     * @private
     */
    this._activeImage = null;

    /**
     * @type {AbortablePromiseRingBuffer}
     * @private
     */
    this._ringbuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {HTMLElement}
     * @private
     */
    this._parentElement = $element.parent().get(0);

    const onWindowResized = () => this._drawImage();
    angular.element($window).on('resize', onWindowResized);
    $scope.$on('$destroy', () => {
      angular.element($window).off(onWindowResized);
    });

    // Update rendered image once the location changes
    $scope.$watch('vm.location', newLocation => {
      if (newLocation === null) {
        if (this._rasterImage) {
          this._context.withScope(scope => {
            this._rasterImage.remove();
            this._rasterImage = null;
            this._activeImage = null;
            scope.view.draw();
          });
        }
        return;
      }

      this._ringbuffer.add(
        this._frameGateway.getImage(newLocation)
      ).then(image => {
        this._activeImage = image;
        this._drawImage();
      });
    });

    // Update filters upon change
    $scope.$watchCollection('vm.filters.filters', () => this._drawImage());
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
   * Draw the currently active Image
   * @private
   */
  _drawImage() {
    const image = this._activeImage;
    const parentElement = this._parentElement;

    if (image === null) {
      return;
    }

    this._context.withScope(scope => {
      if (this._rasterImage) {
        this._rasterImage.remove();
      }

      scope.view.viewSize = new scope.Size(
        parentElement.clientWidth, scope.view.viewSize.height
      );

      const zoom = scope.view.viewSize.width / image.width;
      this._rasterImage = new scope.Raster(image, scope.view.center);
      this._applyFilters(this._rasterImage, this.filters);
      this._rasterImage.scaling = new scope.Point(zoom, zoom);
      scope.view.draw();
    });
  }
}

ThumbnailController.$inject = [
  '$scope',
  '$element',
  '$window',
  'drawingContextService',
  'frameGateway',
];

export default ThumbnailController;

import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import angular from 'angular';

/**
 * Controller managing the display of a single ThumbnailImage
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {window} $window
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {AbortablePromiseFactory} abortable
   */
  constructor($scope, $element, $window, drawingContextService, frameGateway, abortable) {
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
        abortable(this._frameGateway.getImage(newLocation))
      ).then(image => {
        this._activeImage = image;
        this._drawImage();
      });
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
  'abortablePromiseFactory',
];

export default ThumbnailController;

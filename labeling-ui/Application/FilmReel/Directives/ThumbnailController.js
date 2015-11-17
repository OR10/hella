import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * Controller managing the display of a single ThumbnailImage
 */
class ThumbnailController {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {jQuery} $element
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {AbortablePromiseFactory} abortable
   */
  constructor($scope, $element, drawingContextService, frameGateway, abortable) {
    this.width = 300;

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
     * @type {AbortablePromiseRingBuffer}
     * @private
     */
    this._ringbuffer = new AbortablePromiseRingBuffer(1);

    $scope.$watch('vm.location', newLocation => {
      if (this._rasterImage) {
        this._rasterImage.remove();
        this._rasterImage = null;
      }

      if (newLocation === null) {
        return;
      }

      this._ringbuffer.add(
        abortable(this._frameGateway.getImage(newLocation))
      ).then(
        image => this._context.withScope(scope => {
          const zoom = this.width / image.width;
          scope.view.viewSize = new scope.Size(this.width, image.height * zoom);
          this._rasterImage = new scope.Raster(image, scope.view.center);
          this._rasterImage.scaling = new scope.Point(zoom, zoom);
          scope.view.draw();
        })
      );
    });
  }
}

ThumbnailController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
  'frameGateway',
  'abortablePromise',
];

export default ThumbnailController;

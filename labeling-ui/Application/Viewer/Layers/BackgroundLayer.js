import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import paper from 'paper';

/**
 * Layer responsible for displaying video material as a background for the viewer
 *
 * @class BackgroundLayer
 * @implements {Layer}
 *
 * @extends PanAndZoomPaperLayer
 */
export default class BackgroundLayer extends PanAndZoomPaperLayer {
  /**
   * @param {int} width
   * @param {int} height
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   */
  constructor(width, height, $scope, drawingContext) {
    super(width, height, $scope, drawingContext);

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._element = null;

    /**
     * @type {HTMLImageElement}
     * @private
     */
    this._backgroundImage = null;

    /**
     * @type {paper.Raster|null}
     * @private
     */
    this._raster = null;
  }

  render() {
    this._context.withScope(scope => {
      scope.view.update(true);
    });
  }

  attachToDom(element) {
    super.attachToDom(element);

    this._context.withScope(() => {
      this._raster = new paper.Raster();
    });
  }

  /**
   * Sets the background image to be displayed
   *
   * @param {HTMLImageElement} image
   */
  setBackgroundImage(image) {
    this._backgroundImage = image;

    this._drawBackgroundImage();
  }

  exportData() {
    return this._raster.getImageData(new paper.Rectangle(0, 0, this._raster.width, this._raster.height));
  }

  /**
   * Apply a filter to the layer
   *
   * @param {Filter} filter
   */
  applyFilter(filter) {
    // This is needed for the Firefox to work...
    if (!this._backgroundImage) {
      return;
    }

    this._context.withScope(() => {
      let imageData = this._raster.getImageData(new paper.Rectangle(0, 0, this._raster.width, this._raster.height));
      imageData = filter.manipulate(imageData);
      this._raster.setImageData(imageData, new paper.Point(0, 0));
    });
  }

  /**
   * Resets the layer image to remove applied filters
   */
  resetLayer() {
    this._drawBackgroundImage();
  }

  _getViewCenter() {
    return this._context.withScope(scope => {
      return new scope.Point(
        scope.view.viewSize.width / this._scaleToFitZoom / 2,
        scope.view.viewSize.height / this._scaleToFitZoom / 2
      );
    });
  }

  _drawBackgroundImage() {
    if (this._raster) {
      this._raster.remove();
    }

    this._context.withScope(() => {
      this._raster = new paper.Raster(this._backgroundImage, this._getViewCenter());
    });
  }

  resize(width, height) {
    super.resize(width, height);

    this._raster.position = this._getViewCenter();

    this._context.withScope(scope => {
      scope.view.update(true);
    });
  }
}

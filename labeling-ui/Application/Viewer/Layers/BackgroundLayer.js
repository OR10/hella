import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import paper from 'paper';

/**
 * Layer responsible for displaying video material as a background for the viewer
 *
 * @class BackgroundLayer
 * @implements {Layer}
 */
export default class BackgroundLayer extends PanAndZoomPaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super(drawingContextService);

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._element = null;

    /**
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._renderingContext = null;

    /**
     * @type {HTMLImageElement}
     * @private
     */
    this._backgroundImage = null;

    /**
     * @type {ImageData}
     * @private
     */
    this._imageData = null;
  }

  render() {
    this._context.withScope((scope) => {
      this._raster = new paper.Raster(this._backgroundImage, scope.view.center);
      this._imageData = this._raster.getImageData(0, 0, this._element.width, this._element.height);

      scope.view.update(true);
    });
  }

  attachToDom(element) {
    super.attachToDom(element);
  }

  /**
   * Sets the background image to be displayed
   *
   * @param {HTMLImageElement} image
   */
  setBackgroundImage(image) {
    this._backgroundImage = image;
  }

  exportData() {
    return this._element.toDataURL();
  }

  /**
   * Apply a filter to the layer
   *
   * @param {Filter} filter
   */
  applyFilter(filter) {
    this._context.withScope(() => {
      let imageData = this._raster.getImageData(0, 0, this._element.width, this._element.height);
      imageData = filter.manipulate(imageData);
      this._raster.setImageData(imageData, new paper.Point(0, 0));
    });
  }

  /**
   * Resets the layer image to remove applied filters
   */
  resetLayer() {
    this._raster.setImageData(this._imageData, new paper.Point(0, 0));
  }
}

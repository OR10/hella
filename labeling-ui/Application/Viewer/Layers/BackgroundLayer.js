/**
 * Layer responsible for displaying video material as a background for the viewer
 *
 * @class BackgroundLayer
 * @implements {Layer}
 */
export default class BackgroundLayer {
  constructor() {
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
    this._renderingContext.drawImage(this._backgroundImage, 0, 0);
    this._imageData = this._renderingContext.getImageData(0, 0, this._renderingContext.canvas.width, this._renderingContext.canvas.height);
  }

  attachToDom(element) {
    this._element = element;
    this._renderingContext = this._element.getContext('2d');
    this._imageData = this._renderingContext.getImageData(0, 0, this._renderingContext.canvas.width, this._renderingContext.canvas.height);
  }

  dispatchDOMEvent(event) { // eslint-disable-line no-unused-vars
    // This layer does not currently need to relay any events
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
    let imageData = this._renderingContext.getImageData(0, 0, this._renderingContext.canvas.width, this._renderingContext.canvas.height);
    imageData = filter.manipulate(imageData);
    this._renderingContext.putImageData(imageData, 0, 0, 0, 0, this._renderingContext.canvas.width, this._renderingContext.canvas.height);
  }

  /**
   * Resets the layer image to remove applied filters
   */
  resetLayer() {
    this._renderingContext.putImageData(this._imageData, 0, 0, 0, 0, this._renderingContext.canvas.width, this._renderingContext.canvas.height);
  }
}

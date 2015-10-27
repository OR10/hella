/**
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
  }

  render() {
    this._renderingContext.drawImage(this._backgroundImage, 0, 0);
  }

  attachToDom(element) {
    this._element = element;
    this._renderingContext = this._element.getContext('2d');
  }

  dispatchDOMEvent(event) { // eslint-disable-line no-unused-vars
    // This layer does not currently need to relay any events
  }

  /**
   * Sets the background image to be displayed
   * @param {HTMLImageElement} image
   */
  setBackgroundImage(image) {
    this._backgroundImage = image;
  }
}

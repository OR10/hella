/**
 * Layer responsible for displaying crosshairs at the current mouseposition
 *
 * @implements Layer
 */
class CrosshairsLayer {
  /**
   * @param {Number} width
   * @param {Number} height
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   * @param {string} color
   * @param {Number} strokeWidth
   */
  constructor(width, height, viewerMouseCursorService, color, strokeWidth) {
    /**
     * @type {Number}
     * @private
     */
    this._width = width;

    /**
     * @type {Number}
     * @private
     */
    this._height = height;

    /**
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    /**
     * @type {string}
     * @private
     */
    this._color = color;

    /**
     * @type {Number}
     * @private
     */
    this._strokeWidth = strokeWidth;

    /**
     * @type {CanvasRenderingContext2D|null}
     * @private
     */
    this._ctx = null;

    /**
     * @type {HTMLCanvasElement|null}
     * @private
     */
    this._canvas = null;

    /**
     * @type {Array.<Number>|null}
     * @private
     */
    this._lastKnownMouseCoords = null;

    this._viewerMouseCursorService.on('crosshair:updated', visible => {
      if (visible) {
        this.render();
      } else {
        this._clearCanvas();
      }
    });
  }

  /**
   * Execute all drawing and/or rendering operation to update the visual
   * representation of the layer to its current state.
   */
  render() {
    if (this._ctx === null || this._viewerMouseCursorService.isCrosshairShowing() === false) {
      return;
    }

    this._clearCanvas();

    if (this._lastKnownMouseCoords === null) {
      return;
    }

    const ctx = this._ctx;
    const {width, height} = this._canvas;
    const [x, y] = this._lastKnownMouseCoords;

    ctx.strokeStyle = this._color;
    ctx.fillStyle = this._color;
    ctx.strokeWidth = this._strokeWidth;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  _clearCanvas() {
    const ctx = this._ctx;
    const {width, height} = this._canvas;

    // Clear old crosshairs
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Attach the Layer to the given DOM Node.
   * The DOM node is supposed to be the rendering target of the layer.
   *
   * @param {HTMLElement} element
   */
  attachToDom(element) {
    this._canvas = element;
    this._ctx = this._canvas.getContext('2d');

    element.setAttribute('width', this._width);
    element.setAttribute('height', this._height);

    element.addEventListener('mousemove', event => this._onMouseMove(event));
    element.addEventListener('mouseleave', event => this._onMouseLeave(event));
  }

  /**
   * Dispatch an Event to the underlying DOM Elements
   *
   * @param {Event} event
   */
  dispatchDOMEvent(event) {
    this._canvas.dispatchEvent(event);
  }

  /**
   * Resize layer to new dimensions
   *
   * @param {Number} width
   * @param {Number} height
   */
  resize(width, height) {
    this._width = width;
    this._height = height;

    this._canvas.setAttribute('width', width);
    this._canvas.setAttribute('height', height);
    this.render();
  }

  /**
   * Exports the currently drawn image data for this layer encoded as pixel data array
   *
   * @returns {ImageData|null}
   */
  exportData() {
    if (this._ctx === null) {
      return null;
    }

    return this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
  }

  /**
   * @param {Event} event
   * @private
   */
  _onMouseMove(event) {
    this._lastKnownMouseCoords = [event.offsetX, event.offsetY];
    this.render();
  }

  _onMouseLeave() {
    this._lastKnownMouseCoords = null;
    this.render();
  }
}

export default CrosshairsLayer;

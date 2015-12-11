/**
 * Representation of the viewer viewport including zoom level and current viewport position
 */
class Viewport {
  /**
   *
   * @param {Number} scaleToFitZoom
   * @param {Point} center
   * @param {Rectangle} bounds
   */
  constructor(scaleToFitZoom, center, bounds) {
    /**
     * @type {Number}
     * @private
     */
    this._scaleToFitZoom = scaleToFitZoom;

    /**
     * @type {Number}
     */
    this.zoom = scaleToFitZoom;

    /**
     * @type {Point}
     */
    this.center = center;

    /**
     * @type {Rectangle}
     */
    this.bounds = bounds;
  }

  zoomIn(zoomFactor) {
    this.zoom = this.zoom * zoomFactor;
  }

  zoomOut(zoomFactor) {
    this.zoom = Math.max(this.zoom / zoomFactor, this._scaleToFitZoom);
  }

  scaleToFit() {
    this.zoom = this._scaleToFitZoom;
  }
}

export default Viewport;

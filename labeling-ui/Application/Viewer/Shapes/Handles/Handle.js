import paper from 'paper';

/**
 * Abstract base class every handle has to extend from.
 * @abstract
 */
class Handle extends paper.Group {
  /**
   * @param {string} name
   * @param {paper.Point} centerPoint
   */
  constructor(name, centerPoint) {
    // `super` and `super.initialize` are needed due to the way PaperJS handles inheritance
    super();
    super.initialize();
    this.applyMatrix = false;

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {paper.Point}
     * @protected
     */
    this._centerPoint = centerPoint;

    // Listen for zoom in order to provide stable size of the handles but only when shape is not a point shape
    if (this.name !== 'point-center') {
      this.view.on('zoom', event => this._onViewZoomChange(event));
    }
  }

  /**
   * @param {{zoom: number, center: paper.Point}} event
   * @protected
   */
  _onViewZoomChange(event) {
    this.matrix.reset();
    this.scale(1 / event.zoom);
    this.position = this._centerPoint;
  }
}

export default Handle;

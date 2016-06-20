import paper from 'paper';
import Handle from './Handle';

/**
 * Simple rectangle handle shape, with stable size across all zoom levels
 */
class RectangleHandle extends Handle {
  /**
   * @param {string} name
   * @param {string} color
   * @param {number} size
   * @param {paper.Point} centerPoint
   */
  constructor(name, color, size, centerPoint) {
    super(name, centerPoint);

    /**
     * @type {string}
     * @private
     */
    this._color = color;

    /**
     * @type {number}
     * @private
     */
    this._size = size;

    /**
     *
     * @type {paper.Path}
     * @private
     */
    this._rectangle = new paper.Path.Rectangle({
      name: this.name,
      rectangle: {
        topLeft: new paper.Point(0, 0),
        bottomRight: new paper.Point(this._size, this._size),
      },
      selected: false,
      strokeWidth: 0,
      strokeScaling: true,
      fillColor: this._color,
    });

    this.addChild(this._rectangle);

    // Ensure initially correct sizing
    this._onViewZoomChange({zoom: this.view.zoom, center: this.view.center});
  }
}

export default RectangleHandle;

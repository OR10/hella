import paper from 'paper';
import PaperShape from './PaperShape';
import PaperGroupShape from './PaperGroupShape';
import PaperGroupLineMulti from './PaperGroupLineMulti';

/**
 * @extends PaperGroupShape
 */
class PaperGroupLine extends PaperGroupShape {
  /**
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingGroupInFrame, shapeId, points, color) {
    super(labeledThingGroupInFrame, shapeId, color);
    /**
     * @type {Array.<Point>}
     * @private
     */
    this._points = points;

    this._drawShape();
  }

  /**
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    // Filter through all points to get the two farthest points of shape
    const leftPoint = this._points.reduce((initial, current) => initial.x < current.x ? initial : current);
    const rightPoint = this._points.reduce((initial, current) => initial.x > current.x ? initial : current);
    const topPoint = this._points.reduce((initial, current) => initial.y < current.y ? initial : current);
    const bottomPoint = this._points.reduce((initial, current) => initial.y > current.y ? initial : current);
    return {
      width: rightPoint.x - leftPoint.x,
      height: bottomPoint.y - topPoint.y,
      x: leftPoint.x,
      y: topPoint.y,
      point: new paper.Point(leftPoint, topPoint),
    };
  }

  /**
   * @private
   */
  _drawShape() {
    super._drawShape(false);

    this.removeChildren();

    const shape = this._createShape();
    this.addChild(shape);
  }

  /**
   * @returns {paper.Path}
   * @private
   */
  _createShape() {
    return new paper.Path({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      closed: false,
      dashArray: this.dashArray,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: this._points,
    });
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select() {
    this._isSelected = true;
    this._drawShape(false);
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this._drawShape();
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperGroupLine.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier() {
    return 'move';
  }

  /**
   * @param {Point} point
   */
  moveTo() {
    this._drawShape();
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @returns {string}
   */
  getCursor() {
    return 'pointer';
  }

  /**
   * @param {paper.Point} point
   * @param {number} width
   * @param {number} height
   */
  setSize(point, width, height, padding = 5) {
    this._topLeft = new paper.Point(point.x - padding, point.y - padding);
    this._bottomRight = new paper.Point(this._topLeft.x + width + (2 * padding), this._topLeft.y + height + (2 * padding));

    this._drawShape();
  }

  /**
   * Add Padding to the group shape
   * @param {number} padding
   */
  addPadding(padding = PaperGroupLineMulti.PADDING) {
    const {point, width, height} = this.bounds;
    this.setSize(point, width, height, padding);
  }

  resize() {
    // Do nothing
  }

  /**
   * @returns {Point}
   */
  get position() {
    return new paper.Point(
      (this._topLeft.x + this._bottomRight.x) / 2,
      (this._topLeft.y + this._bottomRight.y) / 2
    );
  }

  toJSON() {
    return {
      type: 'group-line',
      id: this._shapeId,
      topLeft: {
        x: Math.round(this._topLeft.x),
        y: Math.round(this._topLeft.y),
      },
      bottomRight: {
        x: Math.round(this._bottomRight.x),
        y: Math.round(this._bottomRight.y),
      },
      labeledThingGroupId: this.labeledThingGroup.id,
    };
  }
}

/**
 * @returns {string}
 */
PaperGroupLine.getClass = () => {
  return 'group-line';
};

export default PaperGroupLine;

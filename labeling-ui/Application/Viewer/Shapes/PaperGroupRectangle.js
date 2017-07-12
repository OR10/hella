import paper from 'paper';
import PaperShape from './PaperShape';
import PaperGroupShape from './PaperGroupShape';


/**
 * @extends PaperGroupShape
 */
class PaperGroupRectangle extends PaperGroupShape {
  /**
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingGroupInFrame, shapeId, topLeft, bottomRight, color) {
    super(labeledThingGroupInFrame, shapeId, color);
    /**
     * @type {Point}
     * @private
     */
    this._topLeft = topLeft;

    /**
     * @type {Point}
     * @private
     */
    this._bottomRight = bottomRight;

    this._drawShape();
  }

  /**
   * @return {{width: number, height: number, x: int, y: int, point: Point}}
   */
  get bounds() {
    return {
      width: this._bottomRight.x - this._topLeft.x,
      height: this._bottomRight.y - this._topLeft.y,
      x: this._topLeft.x,
      y: this._topLeft.y,
      point: this._topLeft,
    };
  }

  /**
   * @private
   */
  _drawShape() {
    this.removeChildren();

    const shape = this._createShape();
    this.addChild(shape);
  }

  /**
   * @returns {Rectangle}
   * @private
   */
  _createShape() {
    return new paper.Path.Rectangle({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 4,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: this._topLeft,
      to: this._bottomRight,
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
    return PaperGroupRectangle.getClass();
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
  addPadding(padding = 5) {
    const {point, width, height} = this.bounds;
    this.setSize(point, width, height, padding);
  }

  resize() {
    // Do nothing
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    const oldTopLeft = this._topLeft;
    const oldBottomRight = this._bottomRight;

    this._topLeft = new paper.Point(
      Math.min(oldTopLeft.x, oldBottomRight.x),
      Math.min(oldTopLeft.y, oldBottomRight.y)
    );
    this._bottomRight = new paper.Point(
      Math.max(oldTopLeft.x, oldBottomRight.x),
      Math.max(oldTopLeft.y, oldBottomRight.y)
    );
    this._drawShape();
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
      type: 'group-rectangle',
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
PaperGroupRectangle.getClass = () => {
  return 'group-rectangle';
};

export default PaperGroupRectangle;

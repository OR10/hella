import paper from 'paper';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';

/**
 * @extends PaperThingShape
 */
class PaperPath extends PaperThingShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, points = [], color, draft = false) {
    super(labeledThingInFrame, shapeId, color, draft);
    /**
     * @type {Array.<Point>}
     * @private
     */
    this._points = points;
    /**
     * @type {bool}
     * @private
     */
    //this._drawShape();
  }

  /**
   * @returns {{width: number, height: number}}
   */
  get bounds() {
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
   * @return {Array.<Point>}
   */
  get points() {
    return this._points;
  }

  /**
   * @param {Boolean} drawHandles
   * @public
   */
  drawShape(shape, drawHandles = true) {
    this.removeChildren();

    this.addChild(shape);

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }
  

  /**
   * @returns {Array.<RectangleHandle>}
   * @private
   */
  _createHandles() {
    return this._points.map(
      (point, index) => new RectangleHandle(
        `point-${index}`,
        '#ffffff',
        this._handleSize,
        point
      )
    );
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select(drawHandles = true) {
    this._isSelected = true;
    this._drawShape(drawHandles);
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
    return PaperPath.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier(handle) {
    if (handle === null) {
      return 'move';
    }

    return 'scale';
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    const moveVector = new paper.Point(point.x - this.position.x, point.y - this.position.y);
    this._points = this._points.map(shapePoint => {
      return new paper.Point(shapePoint).add(moveVector);
    });
    this._drawShape();
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @returns {string}
   */
  getCursor(handle, mouseDown = false) {
    return mouseDown ? 'grabbing' : 'grab';
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   */
  resize(handle, point) {
    const index = parseInt(handle.name.replace('point-', ''), 10);
    this._points[index] = point;
    this._drawShape();
  }

  /**
   * @param {Point} point
   */
  addPoint(point) {
    this._points.push(point);
    this._drawShape();
  }

  /**
   * @param {Point} point
   */
  setSecondPoint(point) {
    this._points[1] = point;
    this._drawShape();
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    this._drawShape();
  }

  /**
   * @returns {Point}
   */
  get position() {
    const leftPoint = this._points.reduce((initial, current) => initial.x < current.x ? initial : current);
    const rightPoint = this._points.reduce((initial, current) => initial.x > current.x ? initial : current);
    const topPoint = this._points.reduce((initial, current) => initial.y < current.y ? initial : current);
    const bottomPoint = this._points.reduce((initial, current) => initial.y > current.y ? initial : current);

    return new paper.Point(
      (leftPoint.x + rightPoint.x) / 2,
      (topPoint.y + bottomPoint.y) / 2
    );
  }

  toJSON() {
    const points = this._points.map(point => {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
    });

    return {
      type: 'path',
      id: this._shapeId,
      points,
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

/**
 * @returns {string}
 */
PaperPath.getClass = () => {
  return 'path';
};

export default PaperPath;

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
   */
  constructor(labeledThingInFrame, shapeId, points = [], color) {
    super(labeledThingInFrame, shapeId, color);
    /**
     * @type {Array.<Point>}
     * @private
     */
    this._points = points;
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
   * @return {Array.<Point>}
   */
  get points() {
    return this._points;
  }

  /**
   * @param {paper.Path} shape
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
   * @param {boolean} drawHandles
   * @protected
   * @abstract
   */
  _renderShape(drawHandles = true) { // eslint-disable-line no-unused-vars
    throw new Error('Abstract function can not be called');
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
    this._renderShape(drawHandles);
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this._renderShape();
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPath.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} keyboardModifiers
   * @returns {string}
   */
  getToolActionIdentifier(handle, keyboardModifiers) {
    if (keyboardModifiers.alt && handle === null) {
      return 'transformation';
    }

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
    this._renderShape();
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @param {boolean} keyboardModifiers
   * @returns {string}
   */
  getCursor(handle, mouseDown = false, keyboardModifiers) {
    if (keyboardModifiers.alt && !handle) {
      return 'add';
    }

    if (keyboardModifiers.alt && handle) {
      return 'remove';
    }

    return mouseDown ? 'grabbing' : 'grab';
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   */
  resize(handle, point) {
    const index = parseInt(handle.name.replace('point-', ''), 10);
    this._points[index] = point;
    this._renderShape();
  }

  /**
   * Adds a point at the given index
   *
   * index positioning is equivilant of the one of array.splice()
   *
   * @param {Point} point
   * @param {number|undefined} index
   */
  addPoint(point, index = undefined) {
    if (index === undefined) {
      this._points.push(point);
    } else {
      this._points.splice(index, 0, point);
    }
    this._renderShape();
  }

  /**
   * Removes a point from the path at the given index
   *
   * @param {number} index
   */
  removePoint(index) {
    this._points.splice(index, 1);
    this._renderShape();
  }

  /**
   * @param {Point} point
   */
  setSecondPoint(point) {
    this._points[1] = point;
    this._renderShape();
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    this._renderShape();
  }

  /**
   * @returns {Point}
   */
  get position() {
    // Filter through all points to get the two farthest points of shape
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

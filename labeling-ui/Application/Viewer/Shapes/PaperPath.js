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

    /**
     * @type {paper.Point}
     * @protected
     */
    this._topClassNamesPoint = null;

    this._topClassNames = [];

    this.view.on('zoom', event => this._onViewZoomChange(event));
  }

  _onViewZoomChange(event) {
    if (this._topClassNamesPoint === null) {
      return;
    }
    let currentOffSet = 0;
    const spacing = 8 / event.zoom;
    currentOffSet = this._topClassNamesPoint.y - spacing;
    this._topClassNames.forEach(topClassName => {
      const oldPoint = topClassName.point;
      oldPoint.y = currentOffSet;
      topClassName.matrix.reset();
      topClassName.scale(1 / event.zoom);
      topClassName.point = oldPoint;
      currentOffSet -= spacing;
    });
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
   * @param {Boolean} drawHandles
   * @protected
   */
  _drawShape(drawHandles = true) {
    super._drawShape(drawHandles);
    this._renderShape(this._createShape(), drawHandles);
  }

  /**
   * @param {Shape} shape
   * @param {boolean} drawHandles
   * @protected
   */
  _renderShape(shape, drawHandles = true) {
    this.removeChildren();
    this._topClassNames = [];
    this._topClassNamesPoint = null;

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
    this._drawShape(false);
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
    this._drawShape();
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
    this._drawShape();
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
    this._drawShape();
  }

  /**
   * Removes a point from the path at the given index
   *
   * @param {number} index
   */
  removePoint(index) {
    this._points.splice(index, 1);
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

  /**
   * @abstract
   * @method PaperPath#_createShape
   */
}

/**
 * @returns {string}
 */
PaperPath.getClass = () => {
  return 'path';
};

export default PaperPath;

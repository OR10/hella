import paper from 'paper';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';

/**
 * @extends PaperThingShape
 */
class PaperRectangle extends PaperThingShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, topLeft, bottomRight, color) {
    super(labeledThingInFrame, shapeId, color);
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
   * @returns {{width: number, height: number}}
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
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    super._drawShape(drawHandles);

    this.removeChildren();

    const shape = this._createShape();
    this._drawClasses()
    this.addChild(shape);

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }

  /**
   * @returns {Rectangle}
   * @private
   */
  _createShape() {
    return new paper.Path.Rectangle({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      dashArray: this.dashArray,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: this._topLeft,
      to: this._bottomRight,
    });
  }

  /**
   * @returns {Array.<RectangleHandle>}
   * @private
   */
  _createHandles() {
    const handleInfo = [
      {name: 'top-left', point: this._topLeft},
      {name: 'top-right', point: new paper.Point(this._bottomRight.x, this._topLeft.y)},
      {name: 'bottom-right', point: this._bottomRight},
      {name: 'bottom-left', point: new paper.Point(this._topLeft.x, this._bottomRight.y)},
    ];

    return handleInfo.map(
      info => new RectangleHandle(
        info.name,
        '#ffffff',
        this._handleSize,
        info.point
      )
    );
  }

  _drawClasses() {
    let currentOffSet = 0;
    const spacing = 7;
    const topPositionY = this._topLeft.y;
    currentOffSet = topPositionY - spacing;
    super.classes.forEach(className => {
      const topLeftX = this._topLeft.x;
      const topClassName = new paper.PointText({
        fontSize: 7,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(topLeftX, currentOffSet),
        fillColor: this._color.primary,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: 2,
        justification: 'left',
        shadowOffset: new paper.Point(2, 2),
        content: className,
      });
      currentOffSet -= spacing;
      this.addChild(topClassName);
    });
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
    return PaperRectangle.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier(handle) {
    if (handle === null) {
      return 'move';
    }

    switch (handle.name) {
      case 'top-left':
      case 'top-right':
      case 'bottom-right':
      case 'bottom-left':
        return 'scale';
      default:
        return 'move';
    }
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    const width = this._bottomRight.x - this._topLeft.x;
    const height = this._bottomRight.y - this._topLeft.y;
    this._topLeft = new paper.Point(point.x - (width / 2), point.y - (height / 2));
    this._bottomRight = new paper.Point(point.x + (width / 2), point.y + (height / 2));
    this._drawShape();
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @returns {string}
   */
  getCursor(handle, mouseDown = false) {
    if (handle === null) {
      return mouseDown ? 'grabbing' : 'grab';
    }

    switch (handle.name) {
      case 'top-left':
        return 'nwse-resize';
      case 'bottom-right':
        return 'nwse-resize';
      case 'top-right':
        return 'nesw-resize';
      case 'bottom-left':
        return 'nesw-resize';
      default:
        return mouseDown ? 'grabbing' : 'grab';
    }
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {{width, height}} minSize
   */
  resize(handle, point, minSize = {width: 1, height: 1}) {
    let minDistancePoint = null;

    switch (handle.name) {
      case 'top-left':
        this._topLeft = this._enforceMinSize(this._bottomRight, point, minSize);
        break;
      case 'top-right':
        minDistancePoint = this._enforceMinSize(new paper.Point(this._topLeft.x, this._bottomRight.y), point, minSize);
        this._topLeft.y = minDistancePoint.y;
        this._bottomRight.x = minDistancePoint.x;
        break;
      case 'bottom-right':
        this._bottomRight = this._enforceMinSize(this._topLeft, point, minSize);
        break;
      case 'bottom-left':
        minDistancePoint = this._enforceMinSize(new paper.Point(this._bottomRight.x, this._topLeft.y), point, minSize);
        this._topLeft.x = minDistancePoint.x;
        this._bottomRight.y = minDistancePoint.y;
        break;
      default:
        throw new Error(`Unknown handle type: ${handle}.`);
    }

    this._drawShape();
  }

  /**
   * @param {Point} fixPoint
   * @param {Point} point
   * @param {{width, height}} minSize
   * @returns {Point}
   * @private
   */
  _enforceMinSize(fixPoint, point, minSize) {
    const newSize = this._calculateSize(fixPoint, point, minSize);
    const {xDirection, yDirection} = this._calculateResizeDirecitons(fixPoint, point);

    return new paper.Point(
      fixPoint.x + xDirection * newSize.width,
      fixPoint.y + yDirection * newSize.height
    );
  }

  /**
   * @param {Point} fixPoint
   * @param {Point} point
   * @param {{width, height}} minSize
   * @private
   *
   * @return {Size}
   */
  _calculateSize(fixPoint, point, minSize) {
    const xDistance = Math.abs(fixPoint.x - point.x);
    const yDistance = Math.abs(fixPoint.y - point.y);
    const width = xDistance > minSize.width ? xDistance : minSize.width;
    const height = yDistance > minSize.height ? yDistance : minSize.height;

    return new paper.Size(width, height);
  }

  /**
   * @param {Point} fixPoint
   * @param {Point} point
   * @private
   */
  _calculateResizeDirecitons(fixPoint, point) {
    const xDirection = Math.abs(fixPoint.x - point.x) > fixPoint.x - point.x ? 1 : -1;
    const yDirection = Math.abs(fixPoint.y - point.y) > fixPoint.y - point.y ? 1 : -1;

    return {xDirection, yDirection};
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
      type: 'rectangle',
      id: this._shapeId,
      topLeft: {
        x: Math.round(this._topLeft.x),
        y: Math.round(this._topLeft.y),
      },
      bottomRight: {
        x: Math.round(this._bottomRight.x),
        y: Math.round(this._bottomRight.y),
      },
    };
  }

  /**
   * @returns {number}
   */
  initialDragDistance() {
    return 4;
  }
}

/**
 * @returns {string}
 */
PaperRectangle.getClass = () => {
  return 'rectangle';
};

export default PaperRectangle;

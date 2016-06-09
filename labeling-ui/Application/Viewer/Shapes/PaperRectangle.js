import paper from 'paper';
import PaperShape from './PaperShape';
import RectangleHandle from './Handles/Rectangle';


/**
 * @extends PaperShape
 */
class PaperRectangle extends PaperShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {string} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, topLeft, bottomRight, color, draft = false) {
    super(labeledThingInFrame, shapeId, draft);
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

    /**
     * @type {string}
     * @private
     */
    this._color = color;

    this._drawShape();
  }

  /**
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    return {
      width: this._bottomRight.x - this._topLeft.x,
      height: this._bottomRight.y - this._topLeft.y,
    };
  }

  /**
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    this.removeChildren();

    const shape = this._createShape();
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
      strokeColor: this._color,
      selected: false,
      strokeWidth: 2,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
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
    const handlePoints = [
      {name: 'top-left', point: this._topLeft},
      {name: 'top-right', point: new paper.Point(this._bottomRight.x, this._topLeft.y)},
      {name: 'bottom-right', point: this._bottomRight},
      {name: 'bottom-left', point: new paper.Point(this._topLeft.x, this._bottomRight.y)},
    ];

    return handlePoints.map(
      info => new RectangleHandle(
        info.name,
        '#ffffff',
        this._handleSize,
        info.point
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
    return 'rectangle';
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
        this._topLeft = this._enforceMinSize(point, this._bottomRight, minSize);
        break;
      case 'top-right':
        minDistancePoint = this._enforceMinSize(point, new paper.Point(this._topLeft.x, this._bottomRight.y), minSize);
        this._topLeft.y = minDistancePoint.y;
        this._bottomRight.x = minDistancePoint.x;
        break;
      case 'bottom-right':
        this._bottomRight = this._enforceMinSize(point, this._topLeft, minSize);
        break;
      case 'bottom-left':
        minDistancePoint = this._enforceMinSize(point, new paper.Point(this._bottomRight.x, this._topLeft.y), minSize);
        this._topLeft.x = minDistancePoint.x;
        this._bottomRight.y = minDistancePoint.y;
        break;
      default:
        throw new Error(`Unknown handle type: ${handle}.`);
    }

    this._drawShape();
  }

  /**
   * @param {Point} point
   * @param {Point} fixPoint
   * @param {{width, height}} minSize
   * @returns {Point}
   * @private
   */
  _enforceMinSize(point, fixPoint, minSize) {
    return new paper.Point(
      Math.abs(point.x - fixPoint.x) > minSize.width ? point.x : fixPoint.x + (((point.x - fixPoint.x) / Math.abs(point.x - fixPoint.x)) * minSize.width),
      Math.abs(point.y - fixPoint.y) > minSize.height ? point.y : fixPoint.y + (((point.y - fixPoint.y) / Math.abs(point.y - fixPoint.y)) * minSize.height)
    );
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    this._topLeft = new paper.Point(
      Math.min(this._topLeft.x, this._bottomRight.x),
      Math.min(this._topLeft.y, this._bottomRight.y)
    );
    this._bottomRight = new paper.Point(
      Math.max(this._topLeft.x, this._bottomRight.x),
      Math.max(this._topLeft.y, this._bottomRight.y)
    );
    this._drawShape();
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
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

export default PaperRectangle;

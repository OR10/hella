import paper from 'paper';
import PaperShape from './PaperShape';
import RectangleHandle from './Handles/Rectangle';


/**
 * @extends PaperThingShape
 */
class PaperMeasurementRectangle extends PaperShape {
  /**
   * @param {string} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {{primary: string, secondary: string}} color
   */
  constructor(shapeId, topLeft, bottomRight, color) {
    super(shapeId, color);
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
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    this.removeChildren();

    const shape = this._createShape();
    this.addChild(shape);
    const measurements = this._createMeasurements();
    this.addChildren(measurements);

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

  _createMeasurements() {
    // Calculate right topLeft and bottomRight coordinates
    const oldTopLeft = this._topLeft;
    const oldBottomRight = this._bottomRight;

    const topLeft = new paper.Point(
      Math.min(oldTopLeft.x, oldBottomRight.x),
      Math.min(oldTopLeft.y, oldBottomRight.y),
    );
    const bottomRight = new paper.Point(
      Math.max(oldTopLeft.x, oldBottomRight.x),
      Math.max(oldTopLeft.y, oldBottomRight.y),
    );

    const margin = 6;
    const fontSize = 12;
    const defaults = {
      fontSize,
      fillColor: this._color.primary,
      justification: 'center',
      shadowColor: new paper.Color(0, 0, 0),
      shadowBlur: 2,
      shadowOffset: new paper.Point(2, 2),
    };
    const measurements = [];

    // Calculate positions
    const leftPoint = new paper.Point(topLeft.x - 2 * margin, topLeft.y + (bottomRight.y - topLeft.y ) / 2);
    const rightPoint = new paper.Point(bottomRight.x + fontSize, bottomRight.y - (bottomRight.y - topLeft.y ) / 2);

    const topPoint = new paper.Point(topLeft.x + (bottomRight.x - topLeft.x) / 2, topLeft.y - margin);
    const bottomPoint = new paper.Point(bottomRight.x - (bottomRight.x - topLeft.x) / 2, bottomRight.y + fontSize);

    measurements.push(
      new paper.PointText(
        Object.assign({}, defaults, {
          point: leftPoint,
          content: `${Math.abs(this.bounds.height)} px`,
          rotation: -90,
        }),
      ),
    );
    measurements.push(
      new paper.PointText(
        Object.assign({}, defaults, {
          point: rightPoint,
          content: `${Math.abs(this.bounds.height)} px`,
          rotation: -90,
        }),
      ),
    );
    measurements.push(
      new paper.PointText(
        Object.assign({}, defaults, {
          point: topPoint,
          content: `${Math.abs(this.bounds.width)} px`,
        }),
      ),
    );
    measurements.push(
      new paper.PointText(
        Object.assign({}, defaults, {
          point: bottomPoint,
          content: `${Math.abs(this.bounds.width)} px`,
        }),
      ),
    );

    return measurements;
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperMeasurementRectangle.getClass();
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
      fixPoint.y + yDirection * newSize.height,
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
   * @return {{xDirection: number, yDirection: number}}
   * @private
   */
  _calculateResizeDirecitons(fixPoint, point) {
    const xDirection = Math.abs(fixPoint.x - point.x) > fixPoint.x - point.x ? 1 : -1;
    const yDirection = Math.abs(fixPoint.y - point.y) > fixPoint.y - point.y ? 1 : -1;

    return {xDirection, yDirection};
  }

  /**
   * @returns {Point}
   */
  get position() {
    return new paper.Point(
      (this._topLeft.x + this._bottomRight.x) / 2,
      (this._topLeft.y + this._bottomRight.y) / 2,
    );
  }
}

/**
 * @returns {string}
 */
PaperMeasurementRectangle.getClass = () => {
  return 'measurement-rectangle';
};

export default PaperMeasurementRectangle;

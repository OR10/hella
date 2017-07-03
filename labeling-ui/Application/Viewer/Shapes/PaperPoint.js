import angular from 'angular';
import paper from 'paper';
import PaperShape from './PaperShape';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';
// Only needed, when using debug rectangle
// import PaperRectangle from './PaperRectangle';

/**
 * @extends PaperPath
 */
class PaperPoint extends PaperThingShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Point} centerPoint
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, centerPoint, color) {
    super(labeledThingInFrame, shapeId, color);

    /**
     * @type {boolean}
     */
    this._isSelected = false;

    /**
     * @type {Point}
     * @private
     */
    this._centerPoint = centerPoint;

    this._drawShape();
    // this._drawDebugRectangle(labeledThingInFrame, shapeId, color);
  }

  /**
   * @param {paper.Path} shape
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    this.removeChildren();

    const outerCircleShape = this._createOuterCircleShape();
    this.addChild(outerCircleShape);

    const lines = this._createCrosshairs();
    lines.forEach(line => this.addChild(line));

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }

  /**
   * Draws a debug rectangle that shows the bounding box used for various geographical
   * matching functions
   *
   * @param labeledThingInFrame
   * @param shapeId
   * @param color
   * @private
   */
  _drawDebugRectangle(labeledThingInFrame, shapeId, color) {
    const pointBounds = this.bounds;
    const topLeft = new paper.Point(pointBounds.x, pointBounds.y);
    const bottomRight = new paper.Point(pointBounds.x + pointBounds.height, pointBounds.y + pointBounds.width);
    const rect = new PaperRectangle(labeledThingInFrame, shapeId, topLeft, bottomRight, color);
    this.addChildren(rect);
  }

  /**
   * @return {paper.Path.Circle}
   * @private
   */
  _createOuterCircleShape() {
    return new paper.Path.Circle({
      center: this._centerPoint,
      radius: PaperPoint.CONTROL_SIZE,
      selected: false,
      strokeColor: this._color.primary,
      strokeWidth: 2,
      strokeScaling: false,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      fillColor: new paper.Color(0, 0, 0, 0),
    });
  }

  /**
   * @return {Array.<paper.Path.Line>}
   * @private
   */
  _createCrosshairs() {
    const crosshairPoints = this._getCrosshairCooridantesOfCenter();
    const shapes = [];
    angular.forEach(crosshairPoints, points => {
      shapes.push(
        new paper.Path.Line({
          from: points[0],
          to: points[1],
          strokeColor: this._color.primary,
          selected: false,
          strokeWidth: 2,
          strokeScaling: false,
          dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
        })
      );
    });
    return shapes;
  }

  /**
   * @return {Array.<paper.Point>}
   * @private
   */
  _getCrosshairCooridantesOfCenter() {
    const centerX = this._centerPoint.x;
    const centerY = this._centerPoint.y;
    const shapeWidth = PaperPoint.CONTROL_SIZE - PaperPoint.FREE_SPACE_BETWEEN_POINT_AND_LINE;

    const fromLeftCenter = new paper.Point(centerX - PaperPoint.CONTROL_SIZE, centerY);
    const toLeftCenter = new paper.Point(fromLeftCenter.x + shapeWidth, centerY);

    const fromTopCenter = new paper.Point(centerX, centerY - PaperPoint.CONTROL_SIZE);
    const toTopCenter = new paper.Point(centerX, fromTopCenter.y + shapeWidth);

    const fromRightCenter = new paper.Point(centerX + PaperPoint.CONTROL_SIZE, centerY);
    const toRightCenter = new paper.Point(fromRightCenter.x - shapeWidth, centerY);

    const fromBottomCenter = new paper.Point(centerX, centerY + PaperPoint.CONTROL_SIZE);
    const toBottomCenter = new paper.Point(centerX, fromBottomCenter.y - shapeWidth);

    return {
      left: [fromLeftCenter, toLeftCenter],
      top: [fromTopCenter, toTopCenter],
      right: [fromRightCenter, toRightCenter],
      bottom: [fromBottomCenter, toBottomCenter],
    };
  }

  /**
   * @returns {Array.<RectangleHandle>}
   * @private
   */
  _createHandles() {
    const handleInfo = [
      {name: 'center', point: this._centerPoint},
    ];

    return handleInfo.map(info =>
      new RectangleHandle(
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
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    const x = this._centerPoint.x - PaperPoint.RADIUS;
    const y = this._centerPoint.y - PaperPoint.RADIUS;
    return {
      width: PaperPoint.DIAMETER,
      height: PaperPoint.DIAMETER,
      x: x,
      y: y,
      point: this._centerPoint,
    };
  }

  /**
   * @param {Handle|null} handle
   * @param {Boolean} mouseDown
   * @returns {string}
   */

  getCursor(handle, mouseDown = false) {  // eslint-disable-line no-unused-vars
    return mouseDown ? 'grabbing' : 'grab';
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier() {
    return 'move';
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {number} minHeight
   */
  resize() {
    this._drawShape();
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    this._centerPoint = point;
    this._drawShape();
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    this._drawShape();
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPoint.getClass();
  }

  /**
   * Convert to JSON for storage
   *
   * @returns {{type: string, id: String, point: {x: number, y: number}}}
   */
  toJSON() {
    const {x, y} = this._centerPoint;

    return {
      type: 'point',
      id: this._shapeId,
      point: {x, y},
    };
  }
}

/**
 * @returns {string}
 */
PaperPoint.getClass = () => {
  return 'point';
};

PaperPoint.CONTROL_SIZE = 10;
PaperPoint.FREE_SPACE_BETWEEN_POINT_AND_LINE = 2;
PaperPoint.RADIUS = PaperPoint.CONTROL_SIZE;
PaperPoint.DIAMETER = PaperPoint.RADIUS * 2;

export default PaperPoint;

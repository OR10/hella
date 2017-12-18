import angular from 'angular';
import paper from 'paper';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';
import PaperRectangle from './PaperRectangle';

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

    this.applyMatrix = false;
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

    this.view.on('zoom', event => this._onViewZoomChange(event));
  }

  /**
   * @param {Boolean} drawHandles
   * @protected
   */
  _drawShape(drawHandles = true) {
    super._drawShape(drawHandles);

    this.removeChildren();

    const outerCircleShape = this._createOuterCircleShape();
    this.addChild(outerCircleShape);

    const lines = this._createCrosshairs();
    lines.forEach(line => this.addChild(line));

    this._onViewZoomChange({zoom: this.view.zoom, center: this.view.center});
  }

  _onViewZoomChange(event) {
    this.matrix.reset();
    const scaleFactor = 1 / event.zoom;
    this.scale(scaleFactor);
    this.position = this._centerPoint;
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
      strokeWidth: 1,
      strokeScaling: false,
      dashArray: this.dashArray,
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
          strokeWidth: 1,
          strokeScaling: false,
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
    const shapeWidth = PaperPoint.CONTROL_SIZE + PaperPoint.CROSSHAIR_OVERFLOW * 2;

    const fromLeft = new paper.Point(centerX - shapeWidth, centerY);
    const toRight = new paper.Point(centerX + shapeWidth, centerY);

    const fromTop = new paper.Point(centerX, centerY - shapeWidth);
    const toBottom = new paper.Point(centerX, centerY + shapeWidth);

    return {
      leftToRight: [fromLeft, toRight],
      topToBottom: [fromTop, toBottom],
    };
  }

  /**
   * @returns {Array.<RectangleHandle>}
   * @private
   */
  _createHandles() {
    return [
      new RectangleHandle(
        'point-center',
        '#ffffff',
        this._handleSize,
        this._centerPoint
      ),
    ];
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
    const x = this._centerPoint.x - PaperPoint.RADIUS - (PaperPoint.CROSSHAIR_OVERFLOW * 2);
    const y = this._centerPoint.y - PaperPoint.RADIUS - (PaperPoint.CROSSHAIR_OVERFLOW * 2);
    return {
      width: PaperPoint.DIAMETER + (PaperPoint.CROSSHAIR_OVERFLOW * 4),
      height: PaperPoint.DIAMETER + (PaperPoint.CROSSHAIR_OVERFLOW * 4),
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
   * @returns {number}
   */
  initialDragDistance() {
    return 1;
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

PaperPoint.CONTROL_SIZE = 6;
PaperPoint.CROSSHAIR_OVERFLOW = 3;
PaperPoint.RADIUS = PaperPoint.CONTROL_SIZE;
PaperPoint.DIAMETER = PaperPoint.RADIUS * 2;

export default PaperPoint;

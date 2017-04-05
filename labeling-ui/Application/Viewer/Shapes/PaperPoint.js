import angular from 'angular';
import paper from 'paper';
import PaperShape from './PaperShape';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';
/**
 * @extends PaperPath
 */
class PaperPoint extends PaperThingShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Point} centerPoint
   * @param {{primary: string, secondary: string}} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, centerPoint, color, draft = false) {
    super(labeledThingInFrame, shapeId, color, draft);

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
  }

  /**
   * @param {paper.Path} shape
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    this.removeChildren();

    const rectangle = this._createOuterCircleShape();
    this.addChild(rectangle);

    const lines = this._createCrosshairs();
    lines.forEach(line => this.addChild(line));

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }

  _createOuterCircleShape() {
    return new paper.Path.Circle({
      center: this._centerPoint,
      radius: PaperPoint.CONTROL_SIZE,
      selected: false,
      strokeColor: this._color.primary,
      strokeWidth: 2,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      fillColor: new paper.Color(0, 0, 0, 0),
    });
  }

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
   * @return {Array.<Point>}
   */
  get points() {
    return this._points;
  }

  get center() {
    return this._centerPoint;
  }

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

    return handleInfo.map(
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
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    return {
      width: PaperPoint.CONTROL_SIZE,
      height: PaperPoint.CONTROL_SIZE,
      x: this._centerPoint.x,
      y: this._centerPoint.y,
      point: this._centerPoint,
    };
  }

  /**
   * @param {Handle|null} handle
   * @param {Boolean} mouseDown
   * @returns {string}
   */
  getCursor(handle, mouseDown = false) {
    if (handle === null) {
      return mouseDown ? 'grabbing' : 'grab';
    }

    switch (handle.name) {
      default:
        return mouseDown ? 'grabbing' : 'grab';
    }
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
   * @returns {{type: string, id: String, point: {x: number, y: number}, labeledThingInFrameId: *}}
   */
  toJSON() {
    return {
      type: 'point',
      id: this._shapeId,
      point: this._centerPoint,
      labeledThingInFrameId: this.labeledThingInFrame.id,
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
export default PaperPoint;

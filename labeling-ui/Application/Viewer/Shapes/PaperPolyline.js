import PaperPath from "./PaperPath";

/**
 * @extends PaperPath
 */
class PaperPolyline extends PaperPath {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   * @param {boolean} draft
   * @param {boolean} isClosed
   */
  constructor(labeledThingInFrame, shapeId, points = [], color, draft = false, isClosed = false) {
    super(labeledThingInFrame, shapeId, points, color, draft, isClosed)
  }

  /**
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    return super.bounds;
  }

  /**
   * @return {Array.<Point>}
   */
  get points() {
    return super.points;
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select(drawHandles = true) {
    super.select(drawHandles)
  }

  /**
   * Deselect the shape
   */
  deselect() {
    super.deselect();
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPolygon.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier(handle) {
    return super.getToolActionIdentifier(handle);
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    super.moveTo(point);
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @returns {string}
   */
  getCursor(handle, mouseDown = false) {
    super.getCursor(handle, mouseDown);
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   */
  resize(handle, point) {
    super.resize(handle, point);
  }

  /**
   * @param {Point} point
   */
  addPoint(point) {
    super.addPoint(point);
  }

  /**
   * @param {Point} point
   */
  setSecondPoint(point) {
    super.setSecondPoint(point);
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    super.fixOrientation();
  }

  /**
   * @returns {Point}
   */
  get position() {
    return super.position;
  }

  toJSON() {
    const points = this._points.map(point => {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
    });

    return {
      type: 'polyline',
      id: this._shapeId,
      points,
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

/**
 * @returns {string}
 */
PaperPolyline.getClass = () => {
  return 'polyline';
};

export default PaperPolyline;

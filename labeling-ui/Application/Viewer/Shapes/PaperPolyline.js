import paper from 'paper';
import PaperPath from './PaperPath';
/**
 * @extends PaperPath
 */
class PaperPolyline extends PaperPath {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   * @param {DrawClassShapeService} drawClassShapeService
   * @param {Array} taskClasses
   */
  constructor(labeledThingInFrame, shapeId, points = [], color, drawClassShapeService, taskClasses) {
    super(labeledThingInFrame, shapeId, points, color, taskClasses);

    this._drawClassShapeService = drawClassShapeService;
    this._drawShape();
  }

  /**
   * @returns {paper.Path}
   * @protected
   */
  _createShape() {
    return new paper.Path({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      closed: false,
      dashArray: this.dashArray,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: this._points,
    });
  }

  _drawShape() {
    super._drawShape();

    if (this._drawClassShapeService.drawClasses) {
      this._drawClasses();
    }
  }

  _drawClasses() {
    const maxValueOfY = Math.min(...this._points.map(point => point.y));
    const highestPoint = this._points.find(point => point.y === maxValueOfY);

    super._drawClasses(highestPoint.x, highestPoint.y);

    this._applyScaleFactor();
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPolyline.getClass();
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
    };
  }

  /**
   * @return {boolean}
   */
  canShowClasses() {
    return true;
  }
}

/**
 * @returns {string}
 */
PaperPolyline.getClass = () => {
  return 'polyline';
};

export default PaperPolyline;

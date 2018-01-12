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
   */
  constructor(labeledThingInFrame, shapeId, points = [], color) {
    super(labeledThingInFrame, shapeId, points, color);
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
    this._drawClasses();
  }

  _drawClasses() {
    const maxValueOfY = Math.min(...this._points.map(point => point.y));
    const highestPoint = this._points.find(point => point.y === maxValueOfY);
    let currentOffSet = 0;
    const spacing = 8;
    currentOffSet = maxValueOfY - spacing;
    super.classes.forEach(className => {
      const topLeftX = highestPoint.x;
      const topClassName = new paper.PointText({
        fontSize: 8,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(topLeftX, currentOffSet),
        fillColor: this._color.primary,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: 2,
        justification: 'left',
        shadowOffset: new paper.Point(1, 1),
        content: className,
      });
      currentOffSet -= spacing;
      this.addChild(topClassName);
    });
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
}

/**
 * @returns {string}
 */
PaperPolyline.getClass = () => {
  return 'polyline';
};

export default PaperPolyline;

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
    super(labeledThingInFrame, shapeId, points, color);
    this.taskClasses = taskClasses;

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

    let currentOffSet = 0;
    const spacing = 8;
    currentOffSet = maxValueOfY - spacing;

    super.classes.forEach(classId => {
      const classObject = this.taskClasses.filter(className => {
        return className.identifier === classId;
      });
      let content = '';
      if (classObject.length > 0) {
        content = classObject[0].className + ': ' + classObject[0].name;
      }

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
        content: content,
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

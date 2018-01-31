import paper from 'paper';
import PaperPath from './PaperPath';

/**
 * @extends PaperPath
 */
class PaperPolygon extends PaperPath {
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
    /**
     * @type {DrawClassShapeService}
     * @private
     */
    this._drawClassShapeService = drawClassShapeService;

    this.taskClasses = taskClasses;

    this._drawShape();
  }

  _drawShape() {
    super._drawShape();

    if (this._drawClassShapeService.drawClasses) {
      this._drawClasses();
    }
  }

  _drawClasses() {
    let currentOffSet = 0;
    const spacing = 8;
    let topX = null;
    let topY = null;
    this._points.forEach(point => {
      if (topY === null || point.y < topY) {
        topX = point.x;
        topY = point.y;
      }
    });

    currentOffSet = topY - spacing;
    const sortedClasses = this.taskClasses.filter(classObject => {
      return super.classes.indexOf(classObject.identifier) !== -1;
    });
    sortedClasses.reverse();
    sortedClasses.forEach(sortedClass => {
      if (this._topClassNamesPoint === null) {
        this._topClassNamesPoint = new paper.Point(topX, topY);
      }
      const topClassName = new paper.PointText({
        fontSize: 8,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(topX, currentOffSet),
        fillColor: this._color.primary,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: 2,
        justification: 'left',
        shadowOffset: new paper.Point(1, 1),
        content: sortedClass.identifier,
        applyMatrix: false,
      });
      currentOffSet -= spacing;
      this._topClassNames.push(topClassName);
      this.addChild(topClassName);
    });
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
      closed: true,
      dashArray: this.dashArray,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: this._points,
    });
  }

  /**
   * @return {boolean}
   */
  canShowClasses() {
    return true;
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPolygon.getClass();
  }

  toJSON() {
    const points = this._points.map(point => {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
    });

    return {
      type: 'polygon',
      id: this._shapeId,
      points,
    };
  }
}

/**
 * @returns {string}
 */
PaperPolygon.getClass = () => {
  return 'polygon';
};

export default PaperPolygon;

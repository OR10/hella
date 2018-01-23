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
   * @param {LabelStructureService} labelStructureService
   * @param {DrawingContext} thingLayerContext
   */
  constructor(labeledThingInFrame, shapeId, points = [], color, drawClassShapeService, labelStructureService, thingLayerContext) {
    super(labeledThingInFrame, shapeId, points, color);
    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {DrawingContext}
     * @private
     */
    this._context = thingLayerContext;

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
    console.error('_drawShape');
    super._drawShape();
    return;


    if (this.classCache === null || this.classCache === undefined) {
      this._labelStructureService.getClassesForTask(this.labeledThingInFrame.task).then(classes => {
        this.classCache = [];
        classes.forEach(classObject => {
          this.classCache.push({
            identifier: classObject.identifier,
            name: classObject.name,
            thingName: classObject.className,
          });
        });
        if (this._drawClassShapeService.drawClasses) {
          this._drawClasses();
        }
      });
    } else {
      if (this._drawClassShapeService.drawClasses) {
        this._drawClasses();
      }
    }
  }

  _drawClasses() {
    const maxValueOfY = Math.min(...this._points.map(point => point.y));
    const highestPoint = this._points.find(point => point.y === maxValueOfY);

    let currentOffSet = 0;
    const spacing = 8;
    currentOffSet = maxValueOfY - spacing;

    if (this.classCache === null || this.classCache === undefined) {
      this._labelStructureService.getClassesForTask(this.labeledThingInFrame.task).then(classes => {
        this.classCache = [];
        classes.forEach(classObject => {
          this.classCache.push({
            identifier: classObject.identifier,
            name: classObject.name,
            thingName: classObject.className,
          });
        });

      });
    }

    super.classes.forEach(classId => {
      const classObject = this.classCache.filter(className => {
        return className.identifier === classId;
      });
      let content = '';
      if (classObject.length > 0) {
        content = classObject[0].thingName + ': ' + classObject[0].name;
      }

      const topLeftX = highestPoint.x;
      this._context.withScope(scope => {
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
        scope.view.update();
      });
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

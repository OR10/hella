class PathCollisionService {
  constructor() {
    /**
     * @type {Array.<PaperThingShape>}
     * @private
     */
    this.shapes = [];
  }

  /**
   * Set actual @link PaperThingShape filtered by only not selected shapes and shapes of type @link PaperPolyline
   *
   * @param {PaperThingShape} shapes
   */
  setShapes(shapes) {
    this.shapes = [];
    this.shapes = shapes;
  }

  /**
   * Search in each shape for start and endpoint and if there is a match in the given radius
   *
   * @param {paper.Point} point
   * @returns {paper.Point|undefined}
   */
  collisionForPoint(point) {
    const shapeStartEndPoints = this._getShapesStartEndPointsSnapping();
    let result = undefined;
    shapeStartEndPoints.some(shapePoint => {
      const calcStartX = Math.pow((shapePoint.start.x - point.x), 2);
      const calcStartY = Math.pow((shapePoint.start.y - point.y), 2);

      const calcEndX = Math.pow((shapePoint.end.x - point.x), 2);
      const calcEndY = Math.pow((shapePoint.end.y - point.y), 2);

      if (calcStartX + calcStartY <= Math.pow(PathCollisionService.RADIUS, 2)) {
        result = shapePoint.start;
        return true;
      }

      if (calcEndX + calcEndY <= Math.pow(PathCollisionService.RADIUS, 2)) {
        result = shapePoint.end;
        return true;
      }
    });
    return result;
  }

  _getShapesStartEndPointsSnapping() {
    const startEndPointsPoly = [];
    this.shapes.forEach(shape => {
      const startEndPointPoly = {
        start: shape.points[0],
        end: shape.points[shape.points.length - 1],
      };
      startEndPointsPoly.push(startEndPointPoly);
    });
    return startEndPointsPoly;
  }
}

PathCollisionService.RADIUS = 10;

export default PathCollisionService;

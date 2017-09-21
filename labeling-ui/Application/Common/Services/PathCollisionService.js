import {cloneDeep, isEqual} from 'lodash';

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
      return false;
    });
    return result;
  }

  /**
   * @param {PaperPolyline} moveShape
   * @returns {Object|undefined}
   */
  connectedShapeAndIndicesForMovingShape(moveShape) {
    // helper function
    const intersectWith = (filterFunction, xs, ys) => xs.filter(x => ys.some(y => filterFunction(x, y)));

    // deep clone because points will change per move
    const movedShapeClone = cloneDeep(moveShape);

    // get shapes that could be connected to the shape that will be move
    const possibleConnectedShapes = this.shapes.filter(storedShapes => storedShapes !== movedShapeClone);
    let returnResult = undefined;

    possibleConnectedShapes.some(connectedShape => {
      // get points that equals in both shapes
      const equalPoints = intersectWith(isEqual, connectedShape.points, movedShapeClone.points);
      if (equalPoints.length !== 0) {
        // indices have to find to recalculate and set new points at the correct position later
        const shapesIndices = [];
        equalPoints.forEach(equalPoint => {
          const connectedShapeIndex = connectedShape.points.indexOf(equalPoint);
          const movedShapeIndex = moveShape.points.indexOf(equalPoint);

          if (connectedShapeIndex !== -1 && movedShapeIndex !== -1) {
            shapesIndices.push({connectedShapeIndex: connectedShapeIndex, movedShapeIndex: movedShapeIndex});
          }
        });
        // return mapped indices and the shape that has to follow moving
        returnResult = {connectedShape, shapesIndices};
        return true;
      }
      return false;
    });
    return returnResult;
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

/* This is the radius in px around start and endpoint where snap detection will work */
PathCollisionService.RADIUS = 10;

export default PathCollisionService;

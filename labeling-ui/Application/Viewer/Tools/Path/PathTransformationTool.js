import paper from 'paper';
import {Vector2} from 'three-math';
import NotModifiedError from '../Errors/NotModifiedError';
import TransformationTool from '../TransformationTool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PathTransformationTool extends TransformationTool {
  /**
   * @param {$rootScope} $rootScope
   * @param {DrawingContext} drawingContext
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, viewerMouseCursorService) {
    super(drawingContext, $rootScope, $q, loggerService, viewerMouseCursorService);

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;

    /**
     * @type {Number|null}
     * @private
     */
    this._modifiedPointIndex = null;
  }

  /**
   * @param {TransformationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeTransformation(toolActionStruct) {
    this._modified = false;

    return super.invokeShapeTransformation(toolActionStruct);
  }

  /**
   * Request tool abortion
   */
  abort() {
    if (this._modified === false) {
      super.abort();
      return;
    }

    // If the shape was modified we simply resolve, what we have so far.
    const {shape} = this._toolActionStruct;
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    const point = event.point;
    const selectedShape = this._toolActionStruct.shape;
    const [hitShape, hitHandle = null] = this._getHitShapeAndHandle(point);

    if (hitHandle && hitShape === selectedShape) {
      this._removeVertexFromShape(hitHandle);
      return;
    }

    this._addVertexToShape(point);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseMove(event) {
    super.onMouseMove(event);
  }

  /**
   * Remove the vertex located at the handle position from the shape
   *
   * @param {Handle} handle
   * @private
   */
  _removeVertexFromShape(handle) {
    const shape = this._toolActionStruct.shape;
    const shapePoints = shape.points.map(point => new paper.Point(point));
    const handleCenter = handle.position;

    const {minHandles = 3} = this._toolActionStruct.options;

    if (shapePoints.length <= minHandles) {
      return;
    }

    const hitVertex = shapePoints.reduce((carry, currentPoint, index) => {
      const distance = currentPoint.getDistance(handleCenter, true);
      if (distance < carry.distance) {
        return {distance, index};
      }
      return carry;
    }, {distance: Infinity, index: -1});

    shape.removePoint(hitVertex.index);

    this._complete(shape);
  }

  /**
   * Add a vertex to the shape at the given point position
   *
   * @param {paper.Point} point
   * @private
   */
  _addVertexToShape(point) {
    const {shape} = this._toolActionStruct;
    const shapePoints = shape.points.map(p => new paper.Point(p));
    const {maxHandles = 15} = this._toolActionStruct.options;

    if (shapePoints.length >= maxHandles) {
      return;
    }

    const index = this._getInsertionIndexForPoint(point);
    shape.addPoint(point, index);
    this._complete(shape);
  }

  /**
   * Get the index in the points array to which the given point is closest to
   *
   * It uses the distance of the point to each path segment the is formed beween each point tuple on the path
   *
   * @param {paper.Point} point
   * @private
   */
  _getInsertionIndexForPoint(point) {
    const {shape} = this._toolActionStruct;
    const shapePoints = shape.points.map(p => new paper.Point(p));

    // Generate tuples for each path segment
    const ntuple = shapePoints.map(
      (firstPoint, firstIndex) => {
        const secondIndex = (firstIndex + 1) % shapePoints.length;
        const secondPoint = shapePoints[secondIndex];
        return [{point: firstPoint, index: firstIndex}, {point: secondPoint, index: secondIndex}];
      }
    );

    const nearestMatch = ntuple.reduce((carry, [first, second]) => {
      const distance = this._calculateDistanceBetweenLineSegmentAndPoint(first.point, second.point, point);

      if (distance <= carry.distance) {
        return {distance: distance, index: first.index};
      }

      return carry;
    }, {distance: Infinity, index: -1});

    // If we match the start-end connection
    if (nearestMatch.index === shapePoints.length - 1) {
      const startDistance = shapePoints[0].getDistance(point, true);
      const endDistance = shapePoints[shapePoints.length - 1].getDistance(point, true);

      return startDistance < endDistance ? 0 : shapePoints.length;
    }

    return nearestMatch.index + 1;
  }

  /**
   * Calculate the min. distance between a point and the line segment between two points
   *
   * @param {paper.Point} firstLinePoint
   * @param {paper.Point} secondLinePoint
   * @param {paper.Point} point
   * @return {number}
   * @private
   */
  _calculateDistanceBetweenLineSegmentAndPoint(firstLinePoint, secondLinePoint, point) {
    const {x: x1, y: y1} = firstLinePoint;
    const {x: x2, y: y2} = secondLinePoint;
    const {x: x0, y: y0} = point;

    const vectorFirstToPoint = new Vector2(x0 - x1, y0 - y1);
    const vectorFirstToSecond = new Vector2(x2 - x1, y2 - y1);

    const lengthFirstToSecond = vectorFirstToSecond.length();

    let projectionLengthNormalized = -1;
    if (lengthFirstToSecond !== 0) {
      projectionLengthNormalized = vectorFirstToPoint.dot(vectorFirstToSecond) / Math.pow(lengthFirstToSecond, 2);
    }

    let projectionVector;
    switch (true) {
      // We are left of the first point
      case projectionLengthNormalized < 0:
        projectionVector = new Vector2(0, 0);
        break;
      // We are right of the second Point
      case projectionLengthNormalized > 1:
        projectionVector = vectorFirstToSecond;
        break;
      // We are between first an second point
      default:
        projectionVector = vectorFirstToSecond.clone().multiplyScalar(projectionLengthNormalized);
    }

    return projectionVector.distanceTo(vectorFirstToPoint);
  }
}

/**
 * Return the name of the tool. The name needs to be unique within the application.
 * Therefore something like a prefix followed by the className is advisable.
 *
 * @return {string}
 * @public
 * @abstract
 * @static
 */
PathTransformationTool.getToolName = () => {
  return 'PathTransformationTool';
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
PathTransformationTool.isShapeClassSupported = shapeClass => {
  return [
    'polygon',
    'polyline',
  ].includes(shapeClass);
};

/**
 * Check if the given actionIdentifer is supported by this tool.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
PathTransformationTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'transformation',
  ].includes(actionIdentifier);
};

PathTransformationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'viewerMouseCursorService',
];

export default PathTransformationTool;

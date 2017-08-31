import paper from 'paper';
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
    }
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

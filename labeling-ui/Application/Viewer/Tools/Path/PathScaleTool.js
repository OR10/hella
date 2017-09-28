import NotModifiedError from '../Errors/NotModifiedError';
import ScalingTool from '../ScalingTool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PathScaleTool extends ScalingTool {
  /**
   * @param {$rootScope} $rootScope
   * @param {DrawingContext} drawingContext
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   * @param {PathCollisionService} pathCollisionService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, pathCollisionService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;

    /**
     * @type {PathCollisionService}
     */
    this._pathCollisionService = pathCollisionService;
  }

  /**
   * @param {ScalingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeScaling(toolActionStruct) {
    this._modified = false;

    return super.invokeShapeScaling(toolActionStruct);
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

  onMouseUp() {
    const {shape} = this._toolActionStruct;
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Path not scaled.'));
      return;
    }

    this._complete(shape);
  }

  onMouseDrag(event) {
    let point = event.point;
    const snapPoint = this._pathCollisionService.collisionForPoint(point);
    if (snapPoint !== undefined) {
      point = snapPoint;
    }
    const {shape, handle} = this._toolActionStruct;
    this._modified = true;

    this._context.withScope(() => {
      shape.resize(handle, point);
    });
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
PathScaleTool.getToolName = () => {
  return 'PathScaleTool';
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
PathScaleTool.isShapeClassSupported = shapeClass => {
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
PathScaleTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'scale',
  ].includes(actionIdentifier);
};

PathScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'pathCollisionService',
];

export default PathScaleTool;

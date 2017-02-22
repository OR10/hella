import ScalingTool from '../ScalingTool';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A Tool for scaling rectangle shapes
 *
 * @implements ToolEvents
 */
class RectangleScaleTool extends ScalingTool {
  /**
   * @param {$rootScope} $rootScope
   * @param {DrawingContext} drawingContext
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;
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

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    const {shape} = this._toolActionStruct;
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Rectangle not scaled.'));
      return;
    }

    shape.fixOrientation();
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;
    const {shape, handle} = this._toolActionStruct;
    this._modified = true;

    const {options: {minimalHeight}} = this._toolActionStruct;
    const minimalSize = {width: 1, height: minimalHeight};

    this._context.withScope(() => {
      shape.resize(handle, point, minimalSize);
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
RectangleScaleTool.getToolName = function () {
  return 'RectangleScaleTool';
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
RectangleScaleTool.isShapeClassSupported = function (shapeClass) {
  return [
    'rectangle',
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
RectangleScaleTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'scale',
  ].includes(actionIdentifier);
};

RectangleScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default RectangleScaleTool;

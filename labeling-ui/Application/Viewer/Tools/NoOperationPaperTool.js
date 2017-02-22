import PaperTool from './PaperTool';
import NotModifiedError from './Errors/NotModifiedError';

/**
 * @abstract
 */
class NoOperationPaperTool extends PaperTool {
  constructor(drawingContext, $scope, $q, loggerService) {
    super(drawingContext, $scope, $q, loggerService);
  }

  _invokeAndRejectWithNotModified(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    this._reject(new NotModifiedError('NoOperationPaperTool did not modify anything'));

    return promise;
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {ScalingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeScaling(toolActionStruct) {
    return this._invokeAndRejectWithNotModified(toolActionStruct);
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {MovingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeMoving(toolActionStruct) {
    return this._invokeAndRejectWithNotModified(toolActionStruct);
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    return this._invokeAndRejectWithNotModified(toolActionStruct);
  }

  /**
   * Create a default shape for this `CreationTool`.
   *
   * Usually the operation will be pseudo synchronous by directly calling {@link Tool#_complete} in its implementation.
   * However it may be asynchronous if needed.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    return this._invokeAndRejectWithNotModified(toolActionStruct);
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
NoOperationPaperTool.getToolName = function () {
  return 'NoOperationPaperTool';
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
NoOperationPaperTool.isShapeClassSupported = function (shapeClass) {
  return true;
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
NoOperationPaperTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'creation',
    'move',
    'scale',
    'none',
  ].includes(actionIdentifier);
};

NoOperationPaperTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default NoOperationPaperTool;
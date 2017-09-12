import PaperTool from './PaperTool';
import NotModifiedError from './Errors/NotModifiedError';

/**
 * @abstract
 */
class NoOperationPaperTool extends PaperTool {
  constructor(drawingContext, $scope, $q, loggerService) {
    super(drawingContext, $scope, $q, loggerService);
  }

  /**
   * @param {ToolActionStruct} toolActionStruct
   * @return {Promise}
   * @private
   */
  _invokeAndRejectWithNotModified(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    this._reject(new NotModifiedError('NoOperationPaperTool did not modify anything'));

    return promise;
  }

  onMouseUp() {
    this._reject(new NotModifiedError('NoOperationPaperTool did not modify anything'));
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
    return this._invoke(toolActionStruct);
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
    return this._invoke(toolActionStruct);
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {TransformationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeTransformation(toolActionStruct) {
    return this._invoke(toolActionStruct);
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
    return this._invoke(toolActionStruct);
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
NoOperationPaperTool.getToolName = () => {
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
 * @return {boolean}
 * @public
 * @abstract
 * @static
 */
NoOperationPaperTool.isShapeClassSupported = () => {
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
 * @return {boolean}
 * @public
 * @abstract
 * @static
 */
NoOperationPaperTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'creation',
    'move',
    'scale',
    'transformation',
  ].includes(actionIdentifier);
};

NoOperationPaperTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default NoOperationPaperTool;

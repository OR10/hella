import Tool from './NewTool';
import NotModifiedError from './Errors/NotModifiedError';

/**
 * @abstract
 */
class NoOperationTool extends Tool {
  constructor(drawingContext, $scope, $q, loggerService) {
    super(drawingContext, $scope, $q, loggerService);
  }

  _invokeAndRejectWithNotModified(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    this._reject(new NotModifiedError('NoOperationTool did not modify anything'));

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

NoOperationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default NoOperationTool;
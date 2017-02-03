import Tool from './NewTool';
import NoOperationError from './Errors/NoOperationError';

class NoOperationTool extends Tool {
  constructor(drawingContext, $scope, $q, loggerService) {
    super(drawingContext, $scope, $q, loggerService);
  }

  _invokeAndRejectWithNoOperation(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    this._reject(new NoOperationError('No operation executed'));

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
    return this._invokeAndRejectWithNoOperation(toolActionStruct);
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
    return this._invokeAndRejectWithNoOperation(toolActionStruct);
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
    return this._invokeAndRejectWithNoOperation(toolActionStruct);
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
    return this._invokeAndRejectWithNoOperation(toolActionStruct);
  }
}

NoOperationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default NoOperationTool;
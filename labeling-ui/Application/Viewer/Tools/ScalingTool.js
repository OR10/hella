import Tool from './NewTool';

class ScalingTool extends Tool {
  constructor(drawingContext, $scope, $q, loggerService) {
    super(drawingContext, $scope, $q, loggerService);
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
}

ScalingTool.$inject = [
  'drawingContext',
  '$scope',
  '$q',
  'loggerService',
];

export default ScalingTool;

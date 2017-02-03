import Tool from './NewTool';

class MovingTool extends Tool {
  constructor($scope, $q, loggerService) {
    super($scope, $q, loggerService);
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
}

MovingTool.$inject = [
  '$scope',
  '$q',
  'loggerService',
];

export default MovingTool;

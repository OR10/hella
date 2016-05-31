import RectangleScaleTool from '../Tools/RectangleScaleTool';
import RectangleMoveTool from '../Tools/RectangleMoveTool';

class ToolService {
  constructor() {
    /**
     * @type {Map}
     * @private
     */
    this._tools = new Map();

    /**
     * @type {Object}
     * @private
     */
    this._classes = {
      'rectangle-move': RectangleMoveTool,
      'rectangle-scale': RectangleScaleTool,
    };
  }

  /**
   * @param {angular.$scope} $scope
   * @param {DrawingContext} context
   * @param {String} shapeClass
   * @param {String} actionIdentifier
   * @returns {Tool}
   */
  getTool($scope, context, shapeClass, actionIdentifier) {
    const toolIdentifier = `${shapeClass}-${actionIdentifier}`;
    const toolMap = this._getToolMap(this._getContextMap($scope), context);

    if (!toolMap.has(toolIdentifier)) {
      toolMap.set(toolIdentifier, new this._classes[toolIdentifier]($scope, context));
    }
    return toolMap.get(toolIdentifier);
  }

  /**
   * @param {angular.$scope} $scope
   * @returns {Map}
   * @private
   */
  _getContextMap($scope) {
    if (!this._tools.has($scope)) {
      this._tools.set($scope, new Map());
    }
    return this._tools.get($scope);
  }

  /**
   * @param {Map} contextMap
   * @param {DrawingContext} context
   * @returns {Map}
   * @private
   */
  _getToolMap(contextMap, context) {
    if (!contextMap.has(context)) {
      contextMap.set(context, new Map());
    }
    return contextMap.get(context);
  }
}

export default ToolService;
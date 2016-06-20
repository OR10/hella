import RectangleMoveTool from '../Tools/Rectangle/RectangleMoveTool';
import RectangleScaleTool from '../Tools/Rectangle/RectangleScaleTool';
import PedestrianMoveTool from '../Tools/Pedestrian/PedestrianMoveTool';
import PedestrianScaleTool from '../Tools/Pedestrian/PedestrianScaleTool';
import CuboidMoveTool from '../../ThirdDimension/Tools/CuboidMoveTool';
import CuboidScaleTool from '../../ThirdDimension/Tools/CuboidScaleTool';

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
      'pedestrian-move': PedestrianMoveTool,
      'pedestrian-scale': PedestrianScaleTool,
      'cuboid-move': CuboidMoveTool,
      'cuboid-scale': CuboidScaleTool,
    };
  }

  /**
   * @param {angular.$scope} $scope
   * @param {DrawingContext} context
   * @param {String} shapeClass
   * @param {String} actionIdentifier
   * @returns {Tool|null}
   */
  getTool($scope, context, shapeClass, actionIdentifier) {
    if (!shapeClass || !actionIdentifier) {
      // Only try to create tool if all parameters are set
      // @TODO: Document in doc-block under which circumstances the returned tool is null
      return null;
    }
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

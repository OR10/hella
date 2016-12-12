import RectangleMoveTool from '../Tools/Rectangle/RectangleMoveTool';
import RectangleScaleTool from '../Tools/Rectangle/RectangleScaleTool';
import RectangleDrawingTool from '../Tools/Rectangle/RectangleDrawingTool';
import PedestrianMoveTool from '../Tools/Pedestrian/PedestrianMoveTool';
import PedestrianScaleTool from '../Tools/Pedestrian/PedestrianScaleTool';
import PedestrianDrawingTool from '../Tools/Pedestrian/PedestrianDrawingTool';
import CuboidMoveTool from '../../ThirdDimension/Tools/CuboidMoveTool';
import CuboidScaleTool from '../../ThirdDimension/Tools/CuboidScaleTool';
import CuboidDrawingTool from '../../ThirdDimension/Tools/CuboidDrawingTool';
import PolygonDrawingTool from '../Tools/Polygon/PolygonDrawingTool';
import PolygonMoveTool from '../Tools/Polygon/PolygonMoveTool';
import PolygonScaleTool from '../Tools/Polygon/PolygonScaleTool';

class ToolService {
  /**
   *
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} colorService
   * @param {LoggerService} loggerService
   */
  constructor(entityIdService, colorService, loggerService) {
    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._colorService = colorService;

    /**
     * @type {LoggerService}
     * @private
     */
    this._loggerService = loggerService;

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
      'rectangle-drawing': RectangleDrawingTool,
      'pedestrian-move': PedestrianMoveTool,
      'pedestrian-scale': PedestrianScaleTool,
      'pedestrian-drawing': PedestrianDrawingTool,
      'cuboid-move': CuboidMoveTool,
      'cuboid-scale': CuboidScaleTool,
      'cuboid-drawing': CuboidDrawingTool,
      'polygon-drawing': PolygonDrawingTool,
      'polygon-scale': PolygonScaleTool,
      'polygon-move': PolygonMoveTool,
    };
  }

  /**
   * @param {angular.$scope} $scope
   * @param {DrawingContext} context
   * @param {String} shapeClass
   * @param {String} actionIdentifier
   * @returns {Tool|null}
   */
  getTool($scope, context, shapeClass, actionIdentifier = 'drawing') {
    if (!shapeClass || !actionIdentifier) {
      // Only try to create tool if all parameters are set
      // @TODO: Document in doc-block under which circumstances the returned tool is null
      return null;
    }
    this._loggerService.groupStart('toolService:getTool', 'Trying to get the tool for the given tool identifier');
    const toolIdentifier = `${shapeClass}-${actionIdentifier}`;
    const toolMap = this._getToolMap(this._getContextMap($scope), context);

    if (!toolMap.has(toolIdentifier)) {
      this._loggerService.log('toolService:getTool', `Tool "${toolIdentifier}" was not created prior. Creating now.`);
      switch (actionIdentifier) {
        case 'drawing':
          toolMap.set(toolIdentifier, new this._classes[toolIdentifier]($scope, context, this._loggerService, this._entityIdService, this._colorService, $scope.vm.video, $scope.vm.task));
          break;
        default:
          toolMap.set(toolIdentifier, new this._classes[toolIdentifier]($scope, context, this._loggerService, $scope.vm.task.drawingToolOptions));
      }
    }
    this._loggerService.log('toolService:getTool', `Returning tool "${toolIdentifier}"`);
    this._loggerService.groupEnd('toolService:getTool');
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

ToolService.$inject = [
  'entityIdService',
  'entityColorService',
  'loggerService',
];

export default ToolService;

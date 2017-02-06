import DeepMap from '../../Common/Helpers/DeepMap';
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
import NoOperationTool from '../Tools/NoOperationTool';

class ToolService {
  /**
   *
   * @param {$injector} $injector
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} colorService
   * @param {LoggerService} loggerService
   */
  constructor($injector, entityIdService, colorService, loggerService) {
    /**
     * @type {$injector}
     * @private
     */
    this._$injector = $injector;

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
    this._toolCache = new DeepMap();

    /**
     * @type {Object}
     * @private
     */
    this._classes = {
      'rectangle-move': RectangleMoveTool,
      'rectangle-scale': RectangleScaleTool,
      'rectangle-creation': RectangleDrawingTool,
      'pedestrian-move': PedestrianMoveTool,
      'pedestrian-scale': PedestrianScaleTool,
      'pedestrian-creation': PedestrianDrawingTool,
      'cuboid-move': NoOperationTool,
      'cuboid-scale': NoOperationTool,
      'cuboid-creation': NoOperationTool,
      'polygon-creation': NoOperationTool,
      'polygon-scale': NoOperationTool,
      'polygon-move': NoOperationTool,
    };
  }

  /**
   * @param {DrawingContext} context
   * @param {string} shapeClass
   * @param {string} actionIdentifier
   * @returns {Tool}
   */
  getTool(context, shapeClass, actionIdentifier = 'creation') {
    this._loggerService.groupStart('toolService:getTool', 'Trying to get the tool for the given tool identifier');
    const toolIdentifier = `${shapeClass}-${actionIdentifier}`;

    if (this._classes[toolIdentifier] === undefined) {
      throw new Error(`Cannot map tool identifier '${toolIdentifier}' to class`);
    }

    if (this._toolCache.has(context, toolIdentifier) === false) {
      this._loggerService.log('toolService:getTool', `Tool "${toolIdentifier}" was not created prior. Creating now.`);
      const toolInstance = this._$injector.instantiate(this._classes[toolIdentifier], {drawingContext: context});
      this._toolCache.set(context, toolIdentifier, toolInstance);
    }
    this._loggerService.log('toolService:getTool', `Returning tool "${toolIdentifier}"`);
    this._loggerService.groupEnd('toolService:getTool');

    return this._toolCache.get(context, toolIdentifier);
  }
}

ToolService.$inject = [
  '$injector',
  'entityIdService',
  'entityColorService',
  'loggerService',
];

export default ToolService;

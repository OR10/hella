import DeepMap from '../../Common/Support/DeepMap';
import RectangleMoveTool from '../Tools/Rectangle/RectangleMoveTool';
import RectangleScaleTool from '../Tools/Rectangle/RectangleScaleTool';
import RectangleDrawingTool from '../Tools/Rectangle/RectangleDrawingTool';
import RectangleKeyboardTool from '../Tools/Rectangle/RectangleKeyboardTool';
import PedestrianMoveTool from '../Tools/Pedestrian/PedestrianMoveTool';
import PedestrianScaleTool from '../Tools/Pedestrian/PedestrianScaleTool';
import PedestrianDrawingTool from '../Tools/Pedestrian/PedestrianDrawingTool';
import PedestrianKeyboardTool from '../Tools/Pedestrian/PedestrianKeyboardTool';
import CuboidDrawingTool from '../Tools/Cuboid/CuboidDrawingTool';
import CuboidScaleTool from '../Tools/Cuboid/CuboidScaleTool';
import CuboidMoveTool from '../Tools/Cuboid/CuboidMoveTool';
import CuboidKeyboardTool from '../Tools/Cuboid/CuboidKeyboardTool';
import PolygonDrawingTool from '../Tools/Polygon/PolygonDrawingTool';
import PolygonMoveTool from '../Tools/Polygon/PolygonMoveTool';
import PolygonScaleTool from '../Tools/Polygon/PolygonScaleTool';
import GroupCreationTool from '../Tools/Group/GroupCreationTool';
import PolygonKeyboardTool from '../Tools/Polygon/PolygonKeyboardTool';
import NoOperationPaperTool from '../Tools/NoOperationPaperTool';
import PolylineDrawingTool from "../Tools/Polyline/PolylineDrawingTool";
import PolylineKeyboardTool from "../Tools/Polyline/PolylineKeyboardTool";

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
     * @type {DeepMap}
     * @private
     */
    this._toolCache = new DeepMap();

    /**
     * @type {Object}
     * @private
     */
    this._classes = [
      RectangleMoveTool,
      RectangleScaleTool,
      RectangleDrawingTool,
      RectangleKeyboardTool,
      PedestrianMoveTool,
      PedestrianScaleTool,
      PedestrianDrawingTool,
      PedestrianKeyboardTool,
      CuboidMoveTool,
      CuboidScaleTool,
      CuboidDrawingTool,
      CuboidKeyboardTool,
      PolygonDrawingTool,
      PolygonScaleTool,
      PolygonMoveTool,
      PolygonKeyboardTool,
      PolylineDrawingTool,
      PolylineKeyboardTool,
      GroupCreationTool,
      NoOperationPaperTool,
    ];
  }

  /**
   * @param {DrawingContext} context
   * @param {string} shapeClass
   * @param {string} actionIdentifier
   * @returns {Tool|null}
   */
  getTool(context, shapeClass, actionIdentifier = 'creation') {
    this._loggerService.groupStart('toolService:getTool', 'Trying to get the tool for the given tool identifier');

    if (this._toolCache.has(context, shapeClass, actionIdentifier) === false) {
      this._loggerService.log('toolService:getTool', `Tool "${shapeClass}-${actionIdentifier}" was not created prior. Creating now.`);
      try {
        const toolClass = this._findToolClassByShapeClassAndActionIdentifier(shapeClass, actionIdentifier);
        const toolInstance = this._$injector.instantiate(toolClass, {drawingContext: context});
        this._toolCache.set(context, shapeClass, actionIdentifier, toolInstance);
      } catch (error) {
        this._loggerService.log('toolService:getTool', `No tool found for "${shapeClass}-${actionIdentifier}"`);
        this._loggerService.groupEnd('toolService:getTool');
        return null;
      }
    }

    this._loggerService.log('toolService:getTool', `Returning tool "${shapeClass}-${actionIdentifier}"`);
    this._loggerService.groupEnd('toolService:getTool');

    return this._toolCache.get(context, shapeClass, actionIdentifier);
  }

  /**
   * @param {string} shapeClass
   * @param {string} actionIdentifier
   * @private
   */
  _findToolClassByShapeClassAndActionIdentifier(shapeClass, actionIdentifier) {
    const toolClass = this._classes.find(
      candidate => candidate.isShapeClassSupported(shapeClass) && candidate.isActionIdentifierSupported(actionIdentifier)
    );

    if (toolClass === undefined) {
      throw new Error(`Cannot map tool identifier '${shapeClass}-${actionIdentifier}' to class`);
    }

    return toolClass;
  }
}

ToolService.$inject = [
  '$injector',
  'entityIdService',
  'entityColorService',
  'loggerService',
];

export default ToolService;

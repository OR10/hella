import PaperPolygon from '../../Shapes/PaperPolygon';
import PathDrawingTool from '../Path/PathDrawingTool';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends PathDrawingTool
 * @implements ToolEvents
 */
class PolygonDrawingTool extends PathDrawingTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {HierarchyCreationService} hierarchyCreationService
   * @param {DrawClassShapeService} drawClassShapeService
   * @param {LabelStructureService} labelStructureService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService, hierarchyCreationService, drawClassShapeService, labelStructureService) {
    super(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService, hierarchyCreationService, PaperPolygon.getClass(), drawClassShapeService, labelStructureService);
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
PolygonDrawingTool.getToolName = () => {
  return 'PolygonDrawingTool';
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
PolygonDrawingTool.isShapeClassSupported = shapeClass => {
  return [
    'polygon',
  ].includes(shapeClass);
};

/**
 * Check if the given actionIdentifer is supported by this tool.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
PolygonDrawingTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'creation',
  ].includes(actionIdentifier);
};

PolygonDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
  'hierarchyCreationService',
  'drawClassShapeService',
  'labelStructureService',
];

export default PolygonDrawingTool;

import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperGroupRectangle from '../../Shapes/PaperGroupRectangle';

class GroupCreationTool extends CreationTool {
  /**
   * @param {Context} drawingContext
   * @param {$scope} $scope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityColorService} entityColorService
   * @param {ToolService} toolService
   * @param {LabeledThingGroupService} labeledThingGroupService
   * @param {HierarchyCreationService} hierarchyCreationService
   */
  constructor(drawingContext, $scope, $q, loggerService, entityColorService, toolService, labeledThingGroupService, hierarchyCreationService) {
    super(drawingContext, $scope, $q, loggerService, hierarchyCreationService);

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;

    /**
     * @type {ToolService}
     * @private
     */
    this._toolService = toolService;

    /**
     * @type {LabeledThingGroupService}
     * @private
     */
    this._labeledThingGroupService = labeledThingGroupService;

    /**
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleCreationTool = this._toolService.getTool(drawingContext, 'rectangle');
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    // Delegating the event down to the used tool
    this._rectangleCreationTool.onMouseDown(event);
  }


  /**
   * @returns {string}
   */
  getToolName() {
    return 'group-rectangle';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'creation',
    ];
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    const promise = super.invokeShapeCreation(toolActionStruct);

    this._rectangleCreationTool.invokeShapeCreation(toolActionStruct).then(paperShape => {
      paperShape.remove();
      const shapes = this._labeledThingGroupService.getShapesWithinBounds(this._context, paperShape.bounds);
      const shapesBound = this._labeledThingGroupService.getBoundsForShapes(shapes);
      const {width, height} = shapesBound;
      let {point: topLeft} = shapesBound;
      let bottomRight = new paper.Point(topLeft.x + width, topLeft.y + height);
      const colorId = this._labeledThingGroupService.getGroupColorFromShapesInGroup(shapes);
      const color = this._entityColorService.getColorById(colorId);

      // Maybe there is a more elegant solution to this problem but for now
      // expanding the rect by 1px on each side is the simplest solution
      topLeft = topLeft.subtract(new paper.Point(1, 1));
      bottomRight = bottomRight.add(new paper.Point(1, 1));

      const labeledThingGroupInFrame = this._hierarchyCreationService.createLabeledThingGroupInFrameWithHierarchy(toolActionStruct);


      let paperGroup;
      this._context.withScope(() => {
        paperGroup = new PaperGroupRectangle(
          labeledThingGroupInFrame,
          paperShape.id,
          topLeft,
          bottomRight,
          color,
          paperShape.isDraft
        );
      });

      // Place this group shape behind all other shapes
      paperGroup.sendToBack();

      this._complete(paperGroup);
    });

    return promise;
  }

  invokeDefaultShapeCreation() {
    this._reject(new Error('Cannot create default shape for groups'));
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
GroupCreationTool.getToolName = function () {
  return 'GroupCreationTool';
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
GroupCreationTool.isShapeClassSupported = function (shapeClass) {
  return [
    'group-rectangle',
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
GroupCreationTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'creation',
  ].includes(actionIdentifier);
};

GroupCreationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityColorService',
  'toolService',
  'labeledThingGroupService',
  'hierarchyCreationService',
];

export default GroupCreationTool;
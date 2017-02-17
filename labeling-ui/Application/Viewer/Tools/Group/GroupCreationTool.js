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

      this._complete(paperGroup);
    });

    return promise;
  }

  invokeDefaultShapeCreation() {
    this._reject(new Error('Cannot create default shape for groups'));
  }
}

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
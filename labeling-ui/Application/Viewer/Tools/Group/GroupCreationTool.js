import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperGroupRectangle from '../../Shapes/PaperGroupRectangle';

class GroupCreationTool extends CreationTool {
  /**
   * @param {Context} drawingContext
   * @param {$scope} $scope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {ToolService} toolService
   * @param {LabeledThingGroupService} labeledThingGroupService
   * @param {HierarchyCreationService} hierarchyCreationService
   */
  constructor(drawingContext, $scope, $q, loggerService, toolService, labeledThingGroupService, hierarchyCreationService) {
    super(drawingContext, $scope, $q, loggerService, hierarchyCreationService);

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
      const shapes = this._labeledThingGroupService.getShapesWithinBounds(this._context, paperShape.bounds);
      const {point: topLeft, width, height} = this._labeledThingGroupService.getBoundsForShapes(shapes);
      const bottomRight = new paper.Point(topLeft.x + width, topLeft.y + height);

      let paperGroup;
      this._context.withScope(() => {
        paperGroup = new PaperGroupRectangle(
          paperShape.labeledThingInFrame,
          paperShape.id,
          topLeft,
          bottomRight,
          paperShape.color,
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
  'toolService',
  'labeledThingGroupService',
  'hierarchyCreationService',
];

export default GroupCreationTool;
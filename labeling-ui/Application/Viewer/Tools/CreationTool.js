import Tool from './NewTool';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

class CreationTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * @type {EntityIdService}
     * @protected
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @protected
     */
    this._entityColorService = entityColorService;
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._logger.log('tool:creation', 'Invoked', toolActionStruct);
    return this._invoke(toolActionStruct);
  }

  /**
   * Create a default shape for this `CreationTool`.
   *
   * Usually the operation will be pseudo synchronous by directly calling {@link Tool#_complete} in its implementation.
   * However it may be asynchronous if needed.
   *
   * @param {CreationToolActionStruct} toolActionStruct
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    return this._invoke(toolActionStruct);
  }

  /**
   * Create a new {@link LabeledThingInFrame} with an attached {@link LabeledThing}
   *
   * Both {@link LabeledObject}s are **NOT** stored to the backend.
   *
   * @return {LabeledThingInFrame}
   * @protected
   */
  _createLabeledThingInFrameWithHierarchy() {
    const {framePosition, task, requirementsThingOrGroupId} = this._toolActionStruct;
    const newLabeledThingId = this._entityIdService.getUniqueId();
    const newLabeledThingInFrameId = this._entityIdService.getUniqueId();
    const color = this._entityColorService.getColorId();

    const newLabeledThing = new LabeledThing({
      task,
      id: newLabeledThingId,
      lineColor: color,
      classes: task.predefinedClasses || [],
      incomplete: true,
      frameRange: {
        startFrameIndex: framePosition.position,
        endFrameIndex: framePosition.position,
      },
    });

    const newLabeledThingInFrame = new LabeledThingInFrame({
      id: newLabeledThingInFrameId,
      classes: [],
      ghostClasses: null,
      incomplete: true,
      frameIndex: framePosition.position,
      labeledThing: newLabeledThing,
      identifierName: requirementsThingOrGroupId,
      shapes: [],
    });

    return newLabeledThingInFrame;
  }
}

CreationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default CreationTool;

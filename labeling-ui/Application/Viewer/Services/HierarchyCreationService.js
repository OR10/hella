import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';
import LabeledThingGroup from 'Application/LabelingData/Models/LabeledThingGroup';
import LabeledThingGroupInFrame from 'Application/LabelingData/Models/LabeledThingGroupInFrame';

class HierarchyCreationService {
  /**
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(entityIdService, entityColorService) {
    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;
  }

  /**
   * Create a new {@link LabeledThingInFrame} with an attached {@link LabeledThing}
   *
   * Both {@link LabeledObject}s are **NOT** stored to the backend.
   *
   * @param {CreationToolActionStruct} creationToolActionStruct
   * @return {LabeledThingInFrame}
   */
  createLabeledThingInFrameWithHierarchy(creationToolActionStruct) {
    const {framePosition, task, requirementsThingOrGroupId} = creationToolActionStruct;
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


  /**
   * Create a {@link LabeledThingGroupInFrame} with an attached {@link LabeledThingGroup}
   *
   * Both {@link LabeledObject}s are **NOT** stored to the backend.
   *
   * @param {CreationToolActionStruct} creationToolActionStruct
   * @return {LabeledThingGroupInFrame}
   */
  createLabeledThingGroupInFrameWithHierarchy(creationToolActionStruct) {
    const newLabeledThingGroup = new LabeledThingGroup({
      id: this._entityIdService.getUniqueId(),
      lineColor: this._entityColorService.getColorId(),
      type: creationToolActionStruct.requirementsThingOrGroupId,
      groupIds: [],
    });

    const newLabeledThingGroupInFrame = new LabeledThingGroupInFrame({
      id: this._entityIdService.getUniqueId(),
      frameIndex: creationToolActionStruct.framePosition.position,
      classes: [],
      labeledThingGroup: newLabeledThingGroup,
    });

    return newLabeledThingGroupInFrame;
  }
}

HierarchyCreationService.$inject = [
  'entityIdService',
  'entityColorService',
];

export default HierarchyCreationService;

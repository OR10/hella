import Tool from './Tool';
import LabeledThing from 'Application/LabelingData/Models/LabeledThing';
import LabeledThingInFrame from 'Application/LabelingData/Models/LabeledThingInFrame';

/**
 * Base class for drawing related {@link Tool}s
 *
 * @extends Tool
 */
class DrawingTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Video} video
   * @param {Task} task
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, video, task) {
    super(drawingContext, task.drawingToolOptions);

    /**
     * @type {$rootScope.Scope}
     * @protected
     */
    this._$scope = $scope;

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

    /**
     * @type {Video}
     * @private
     */
    this._video = video;

    /**
     * @type {Task}
     * @private
     */
    this._task = task;
  }

  /**
   * Create a new {@link LabeledThingInFrame} with an attached {@link LabeledThing}
   *
   * Both {@link LabeledObject}s are **NOT** stored to the backend.
   *
   * @return {LabeledThingInFrame}
   * @protected
   */
  _createLabeledThingHierarchy() {
    const framePosition = this._$scope.vm.framePosition;
    const newLabeledThingId = this._entityIdService.getUniqueId();
    const newLabeledThingInFrameId = this._entityIdService.getUniqueId();
    const color = this._entityColorService.getColorId();

    const newLabeledThing = new LabeledThing({
      id: newLabeledThingId,
      lineColor: color,
      classes: this._$scope.vm.task.predefinedClasses || [],
      incomplete: true,
      task: this._$scope.vm.task,
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
      shapes: [],
    });

    return newLabeledThingInFrame;
  }
}

export default DrawingTool;

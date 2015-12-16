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
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    super(drawingContext, options);

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
     * @private
     */
    this._entityColorService = entityColorService;
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
    const color = this._entityColorService.getColor();

    const newLabeledThing = new LabeledThing({
      id: newLabeledThingId,
      lineColor: color,
      classes: [],
      incomplete: true,
      task: this._$scope.vm.task,
      frameRange: {
        startFrameNumber: framePosition.position,
        endFrameNumber: framePosition.position,
      },
    });

    const newLabeledThingInFrame = new LabeledThingInFrame({
      id: newLabeledThingInFrameId,
      classes: [],
      incomplete: true,
      frameNumber: framePosition.position,
      labeledThing: newLabeledThing,
      shapes: [],
    });

    return newLabeledThingInFrame;
  }
}

export default DrawingTool;

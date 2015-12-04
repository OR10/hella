// @TODO: Load from the server assigned to a certain task
import labeledFrameStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
import labeledFrameAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
import labeledThingStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
import labeledThingAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

import FramePosition from '../Model/FramePosition';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {{task: Task, video: Video}} initialData
   * @param {User} user
   * @param {LabeledFrameGateway} labeledFrameGateway
   */
  constructor($scope, initialData, user, labeledFrameGateway) {
    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

    /**
     * @type {Task}
     */
    this.task = initialData.task;

    /**
     * @type {Video}
     */
    this.video = initialData.video;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * Currently active frame position to be displayed inside the MediaControls
     *
     * This model will be manipulated by different directives in order to switch between frames.
     *
     * @type {FramePosition}
     */
    this.framePosition = new FramePosition(this.task.frameRange);

    /**
     * @type {LabeledFrameGateway}
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @TODO Move into LabelSelector when refactoring for different task types
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledFrameBuffer = new AbortablePromiseRingBuffer(1);

    this.labeledThingStructure = labeledThingStructure;
    this.labeledThingAnnotation = labeledThingAnnotation;

    /**
     * @TODO Move into LabelSelector when refactoring for different task types
     * The LabeledFrame for the currently active frame
     *
     * @type {LabeledFrame|null}
     */
    this.labeledFrame = null;

    this.labeledFrameStructure = labeledFrameStructure;
    this.labeledFrameAnnotation = labeledFrameAnnotation;

    /**
     * Information about the labeling state of the `selectedLabeledThingInFrame`
     *
     * @type {boolean}
     */
    this.selectedLabeledThingInFrameCompletelyLabeled = false;


    // Watch for changes of the Frame position to correctly update all
    // data structures for the new frame
    $scope.$watch('vm.framePosition.position', newFramePosition => {
      this._labeledFrameBuffer.add(this._loadLabeledFrame(newFramePosition))
        .then(labeledFrame => this.labeledFrame = labeledFrame);
    });
  }

  /**
   * Load the {@link LabeledFrame} structure for the given frame
   * @param frameNumber
   * @returns {AbortablePromise<LabeledFrame>}
   * @private
   */
  _loadLabeledFrame(frameNumber) {
    return this._labeledFrameGateway.getLabeledFrame(this.task.id, frameNumber);
  }
}

TaskController.$inject = ['$scope', 'initialData', 'user', 'labeledFrameGateway'];

export default TaskController;

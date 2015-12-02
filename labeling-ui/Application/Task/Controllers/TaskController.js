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
   * @param {angular.$q} $q
   * @param {{task: Task, video: Video}} initialData
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor($scope, $q, initialData, labeledThingInFrameGateway, labeledThingGateway, labeledFrameGateway, abortablePromiseFactory) {
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
     * @type {angular.$q}
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * Currently active frame position to be displayed inside the Viewer
     *
     * This model will be manipulated by different directives in order to switch between frames.
     *
     * @type {FramePosition}
     */
    this.framePosition = new FramePosition(this.task.frameRange);

    /**
     * A structure holding all LabeledThingInFrames for the currently active frame
     *
     * @type {Object<string|LabeledThingInFrame>|null}
     */
    this.labeledThingsInFrame = null;

    /**
     * A structure holding all LabeledThings for the currently active frame
     *
     * @type {Object<string|LabeledThing>|null}
     */
    this.labeledThings = null;

    this.labeledThingStructure = labeledThingStructure;
    this.labeledThingAnnotation = labeledThingAnnotation;

    /**
     * The LabeledFrame for the currently active frame
     *
     * @type {LabeledFrame|null}
     */
    this.labeledFrame = null;

    this.labeledFrameStructure = labeledFrameStructure;
    this.labeledFrameAnnotation = labeledFrameAnnotation;

    /**
     * @type {Tool|null}
     */
    this.activeTool = null;

    /**
     * @type {LabeledThingInFrame|null}
     */
    this.selectedLabeledThingInFrame = null;

    /**
     * Information about the labeling state of the `selectedLabeledThingInFrame`
     *
     * @type {boolean}
     */
    this.selectedLabeledThingInFrameCompletelyLabeled = false;

    /**
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

    /**
     * @type {LabeledThingInFrameGateway}
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledThingInFrameBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {LabeledThingGateway}
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledThingBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {LabeledFrameGateway}
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._labeledFrameBuffer = new AbortablePromiseRingBuffer(1);

    // Watch for changes of the Frame position to correctly update all
    // data structures for the new frame
    $scope.$watch('vm.framePosition.position', newFramePosition => {
      this._handleFrameChange(newFramePosition);
    });
  }

  /**
   * Load all {@link LabeledThingInFrame} for a corresponding frame
   *
   * The frameNumber is 1-Indexed
   *
   * @param {int} frameNumber
   * @returns {AbortablePromise<LabeledThingInFrame[]>}
   * @private
   */
  _loadLabeledThingsInFrame(frameNumber) {
    return this._labeledThingInFrameGateway.listLabeledThingInFrame(this.task, frameNumber);
  }

  /**
   *
   * @private
   */
  _loadLabeledThings(labeledThingIds) {
    return this._abortablePromiseFactory(
      this._$q.all(
        labeledThingIds.map(labeledThingId => {
          return this._labeledThingGateway.getLabeledThing(this.task, labeledThingId);
        })
      )
    );
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

  /**
   * Handle the change to new frame
   *
   * The frame change includes things like loading all frame relevant data from the backend,
   * as well as propagating this information to all subcomponents
   *
   * @param {int} frameNumber
   * @private
   */
  _handleFrameChange(frameNumber) {
    this.labeledThingsInFrame = null;
    this.labeledFrame = null;

    this._labeledThingInFrameBuffer.add(
      this._loadLabeledThingsInFrame(frameNumber)
      )
      .then(labeledThingsInFrame => {
        const labeledThingIds = [];
        this.labeledThingsInFrame = {};

        labeledThingsInFrame.forEach(labeledThingInFrame => {
          this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
          labeledThingIds.push(labeledThingInFrame.labeledThingId);
        });

        this._labeledThingBuffer.add(this._loadLabeledThings(labeledThingIds))
          .then(labeledThings => {
            this.labeledThings = {};

            labeledThings.forEach(labeledThing => {
              this.labeledThings[labeledThing.id] = labeledThing;
            });
          });
      });

    this._labeledFrameBuffer.add(
      this._loadLabeledFrame(frameNumber)
      )
      .then(labeledFrame => this.labeledFrame = labeledFrame);
  }
}

TaskController.$inject = [
  '$scope',
  '$q',
  'initialData',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
  'labeledFrameGateway',
  'abortablePromiseFactory',
];

export default TaskController;

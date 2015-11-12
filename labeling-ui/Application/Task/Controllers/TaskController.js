//@TODO: Load from the server assigned to a certain task
import labeledFrameStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
import labeledFrameAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
import labeledThingStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
import labeledThingAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

import FramePosition from '../Model/FramePosition';

class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$q} $q
   * @param {Task} task
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {SelectedLabelObjectLabelStructureVisitor} selectedLabelObjectVisitor
   * @param {SelectedLabelListLabelStructureVisitor} selectedLabelListVisitor
   */
  constructor($scope, $q, task, labeledThingInFrameGateway, labeledFrameGateway, selectedLabelObjectVisitor, selectedLabelListVisitor) {
    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

    /**
     * @type {angular.$q}
     */
    this._$q = $q;

    /**
     * The currently processed {@link Task}
     *
     * This Model should be treated read-only by receiving directives
     *
     * @type {Task}
     */
    this.task = task;

    /**
     * Currently active frame position to be displayed inside the Viewer
     *
     * This model will be manipulated by different directives in order to switch between frames.
     *
     * @type {FramePosition}
     */
    this.framePosition = new FramePosition(task.frameRange);

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
     * @type {LabeledThingInFrameGateway}
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {LabeledFrameGateway}
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {SelectedLabelObjectLabelStructureVisitor}
     * @private
     */
    this._selectedLabelObjectVisitor = selectedLabelObjectVisitor;

    /**
     * @type {SelectedLabelListLabelStructureVisitor}
     * @private
     */
    this._selectedLabelListVisitor = selectedLabelListVisitor;

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
   * @returns {Promise<LabeledThingInFrame[]>}
   * @private
   */
  _loadLabeledThingsInFrame(frameNumber) {
    return this._labeledThingInFrameGateway.listLabeledThingInFrame(this.task, frameNumber);
  }

  /**
   * Load all {@link LabeledThing}s for a given frame
   *
   * @param {int} frameNumber
   * @returns {Array.<LabeledThing>}
   *
   * @private
   *
   * @TODO implement once we support inter-frame object tracking
   */
  _loadLabeledThings(frameNumber) { // eslint-disable-line no-unused-vars
    return [];
  }

  /**
   * Load the {@link LabeledFrame} structure for the given frame
   * @param frameNumber
   * @returns {Promise<LabeledFrame>}
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
    this.labeledThings = null;
    this.labeledFrame = null;

    this._$q.all([
      this._loadLabeledThingsInFrame(frameNumber),
      this._loadLabeledThings(frameNumber),
      this._loadLabeledFrame(frameNumber),
    ]).then(([labeledThingsInFrame, labeledThings, labeledFrame]) => {
      this.labeledThingsInFrame = {};
      labeledThingsInFrame.forEach(labeledThingInFrame => {
        this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
      });

      this.labeledThings = {};
      labeledThings.forEach(labeledThing => {
        this.labeledThings[labeledThing.id] = labeledThing;
      });

      this.labeledFrame = labeledFrame;
    });
  }
}

TaskController.$inject = [
  '$scope',
  '$q',
  'task',
  'labeledThingInFrameGateway',
  'labeledFrameGateway',
];

export default TaskController;

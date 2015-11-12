import FramePosition from '../Model/FramePosition';

class TaskController {
  /**
   * @param {angular.Scope} $scope
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
     * {angular.$q}
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

    /**
     * The LabeledFrame for the currently active frame
     *
     * @type {LabeledFrame|null}
     */
    this.labeledFrame = null;

    /**
     * @type {Tool|null}
     */
    this.activeTool = null;

    /**
     * @type {LabeledThingInFrame|null}
     */
    this.selectedThingInFrame = null;

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

    $scope.$watch('vm.framePosition.position', newFramePosition => {
      this._handleFrameChange(newFramePosition);
    }, true);

    //this.hideObjectLabels = true;
    //this.objectLabelingCompleted = false;
    //this.metaLabelingCompleted = false;

    //$scope.storeLabeledFrame = () => {
    //  const labels = Object.values(this.metaLabelContext);
    //  const cleanedLabels = this._selectedLabelListVisitor.visit(
    //    this._linearVisitor.visit(this.metaLabelStructure, labels)
    //  );
    //  this._labeledFrame.classes = cleanedLabels;
    //  this._labeledFrame.frameNumber = this.framePosition.position;
    //  this._labeledFrameGateway.saveLabeledFrame(this.task.id, this.framePosition.position, this._labeledFrame)
    //    .then(labeledFrame => this._labeledFrame = labeledFrame);
    //};

    //$scope.storeLabeledThingInFrame = () => {
    //  if (this._activeLabeledThingInFrame.id === undefined) {
    //    this._labeledThingInFrameGateway.createLabeledThingInFrame(
    //      this.task,
    //      this.framePosition.position,
    //      this._activeLabeledThingInFrame
    //      )
    //      .then(labeledThing => {
    //        this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing;
    //        this._activeLabeledThingInFrame = labeledThing;
    //      });
    //  } else {
    //    this._labeledThingInFrameGateway.updateLabeledThingInFrame(
    //      this._activeLabeledThingInFrame
    //    )
    //    .then(labeledThing => {
    //      this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing;
    //      this._activeLabeledThingInFrame = labeledThing;
    //    });
    //  }
    //};



    //$scope.$watchCollection('vm.metaLabelContext', () => {
    //  if (this.metaLabelingCompleted) {
    //    this._metaLabelWorkflow.transition('complete-labels');
    //  } else {
    //    this._metaLabelWorkflow.transition('incomplete-labels');
    //  }
    //});

    //$scope.$watch('vm.metaLabelingCompleted', completed => {
    //  // The switch Incomplete -> Complete happens after the context update :(
    //  if (completed) {
    //    this._metaLabelWorkflow.transition('complete-labels');
    //  }
    //});

    //$scope.$watchCollection('vm.objectLabelContext', newContext => {
    //  if (this._activeLabeledThingInFrame !== null) {
    //    this._activeLabeledThingInFrame.classes = Object.values(newContext);
    //  }
    //
    //  if (this.objectLabelingCompleted) {
    //    this._objectLabelWorkflow.transition('complete-labels');
    //  } else {
    //    this._objectLabelWorkflow.transition('incomplete-labels');
    //  }
    //});

    //$scope.$watch('vm.objectLabelingCompleted', completed => {
    //  // The switch Incomplete -> Complete happens after the context update :(
    //  if (completed) {
    //    this._objectLabelWorkflow.transition('complete-labels');
    //  }
    //});
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
      this.labeledThings = {};

      labeledThingsInFrame.forEach(labeledThingInFrame => {
        this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
      });

      labeledThings.forEach(labeledThing => {
        this.labeledThings[labeledThing.id] = labeledThing;
      });

      this.labeledFrame = labeledFrame;
    });
  }

  //createLabelObjectContextFromArray(structure, context) {
  //  const annotatedLinearLabelStructure = this._linearVisitor.visit(structure, context);
  //  return this._selectedLabelObjectVisitor.visit(annotatedLinearLabelStructure);
  //}

  //handleNewThing(shapes) {
  //  this._activeLabeledThingInFrame = {
  //    frameNumber: this.framePosition.position,
  //    shapes,
  //    classes: Object.values(this.objectLabelContext),
  //  };
  //
  //  this._objectLabelWorkflow.transition('new-thing');
  //}

  //handleUpdatedThing(labeledThing) {
  //  this.handleSelectedThing(labeledThing); // @TODO: Temporary fix for incorrect selection handling
  //  this._objectLabelWorkflow.transition('edit-thing');
  //}

  //handleSelectedThing(labeledThing) {
  //  this._initializeWorkflow(); // @TODO: properly integrate change with handling
  //  this._activeLabeledThingInFrame = labeledThing;
  //  this.$scope.$apply(
  //    () => this._objectLabelWorkflow.transition('edit-labeled-thing', labeledThing)
  //  );
  //}

  //handleDeselectedThing() {
  //  this._activeLabeledThingInFrame = null;
  //  this.$scope.$apply(() => {
  //    this.hideObjectLabels = true;
  //  });
  //}

  //handleNewEllipseRequested() {
  //  this.activeTool = 'ellipse';
  //}

  //handleNewCircleRequested() {
  //  this.activeTool = 'circle';
  //}

  //handleNewPolygonRequested() {
  //  this.activeTool = 'polygon';
  //}

  //handleNewLineRequested() {
  //  this.activeTool = 'line';
  //}
  //
  //handleMoveToolRequested() {
  //  this.activeTool = 'move';
  //}
}

TaskController.$inject = [
  '$scope',
  '$q',
  'task',
  'labeledThingInFrameGateway',
  'labeledFrameGateway',
];

export default TaskController;

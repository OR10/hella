import metaLabelStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
import metaLabelAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
import objectLabelStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
import objectLabelAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

import ObjectLabelWorkflow from '../Workflows/ObjectLabelWorkflow';
import MetaLabelWorkflow from '../Workflows/MetaLabelWorkflow';

export default class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {Task} task
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {FrameGateway} frameGateway
   * @param {LinearLabelStructureVisitor} linearVisitor
   * @param {SelectedLabelObjectLabelStructureVisitor} selectedLabelObjectVisitor
   * @param {SelectedLabelListLabelStructureVisitor} selectedLabelListVisitor
   */
  constructor($scope, task, labeledThingInFrameGateway, labeledFrameGateway, taskFrameLocationGateway, frameGateway, linearVisitor, selectedLabelObjectVisitor, selectedLabelListVisitor) {
    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

    /**
     * @type {LabeledThingInFrameGateway}
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {LabeledFrameGateway}
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {TaskFrameLocationGateway}
     */
    this._taskFrameLocationGateway = taskFrameLocationGateway;

    /**
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    /**
     * @type {LinearLabelStructureVisitor}
     * @private
     */
    this._linearVisitor = linearVisitor;

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

    /**
     * Default placeholder image, which is used whenever a current image is not available
     * @type {HTMLImageElement}
     * @private
     */
    this._placeholderImage = new Image();
    this._placeholderImage.src = '/labeling/Images/placeholder.png';

    /**
     * The currently processed {@link Task}
     *
     * @type {Task}
     */
    this.task = task;

    /**
     * The framenumber currently active and displayed
     *
     * @type {number}
     * @private
     */
    this._frameNumber = 1;

    /**
     * Image representing the currently active frame
     *
     * @type {HTMLImageElement}
     */
    this.frameImage = this._placeholderImage;

    /**
     * LabeledFrame associated with the currently active frame
     *
     * @type {LabeledFrame|null}
     * @private
     */
    this._labeledFrame = null;

    /**
     * A structure holding all labels as well as all labeledThings for the currently active frame
     *
     * @type {{labels: Array<String>, things: Object<string|number, LabeledThingInFrame>}}
     */
    this.labelsAndThingsInFrame = {
      labels: [],
      things: {},
    };

    /*
     * @TODO: Replace with real data provided by the server?
     *        Currently only some hardcoded mock data is loaded for the classes to be tagged
     */
    this.metaLabelStructure = metaLabelStructure;
    this.objectLabelStructure = objectLabelStructure;
    this.metaLabelAnnotation = metaLabelAnnotation;
    this.objectLabelAnnotation = objectLabelAnnotation;

    this.hideObjectLabels = true;
    this.objectLabelContext = {};
    this.metaLabelContext = {};
    this.objectLabelingCompleted = false;
    this.metaLabelingCompleted = false;

    this.activeTool = null;

    $scope.storeLabeledFrame = () => {
      const labels = Object.values(this.metaLabelContext);
      const cleanedLabels = this._selectedLabelListVisitor.visit(
        this._linearVisitor.visit(this.metaLabelStructure, labels)
      );
      this._labeledFrame.classes = cleanedLabels;
      this._labeledFrame.frameNumber = this._frameNumber;
      this._labeledFrameGateway.saveLabeledFrame(this.task.id, this._frameNumber, this._labeledFrame)
        .then(labeledFrame => this._labeledFrame = labeledFrame);
    };

    $scope.storeLabeledThingInFrame = () => {
      if (this._activeLabeledThingInFrame.id === undefined) {
        this._labeledThingInFrameGateway.createLabeledThingInFrame(
          this.task,
          this._frameNumber,
          this._activeLabeledThingInFrame
          )
          .then(labeledThing => {
            this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing;
            this._activeLabeledThingInFrame = labeledThing;
          });
      } else {
        this._labeledThingInFrameGateway.updateLabeledThingInFrame(
          this._activeLabeledThingInFrame
        )
        .then(labeledThing => {
          this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing;
          this._activeLabeledThingInFrame = labeledThing;
        });
      }
    };

    this._initializeWorkflows();

    $scope.$watchCollection('vm.metaLabelContext', () => {
      if (this.metaLabelingCompleted) {
        this._metaLabelWorkflow.transition('complete-labels');
      } else {
        this._metaLabelWorkflow.transition('incomplete-labels');
      }
    });

    $scope.$watch('vm.metaLabelingCompleted', completed => {
      // The switch Incomplete -> Complete happens after the context update :(
      if (completed) {
        this._metaLabelWorkflow.transition('complete-labels');
      }
    });

    $scope.$watchCollection('vm.objectLabelContext', newContext => {
      if (this._activeLabeledThingInFrame !== null) {
        this._activeLabeledThingInFrame.classes = Object.values(newContext);
      }

      if (this.objectLabelingCompleted) {
        this._objectLabelWorkflow.transition('complete-labels');
      } else {
        this._objectLabelWorkflow.transition('incomplete-labels');
      }
    });

    $scope.$watch('vm.objectLabelingCompleted', completed => {
      // The switch Incomplete -> Complete happens after the context update :(
      if (completed) {
        this._objectLabelWorkflow.transition('complete-labels');
      }
    });

    /**
     * List of frame location information for this task.
     *
     * Currently all framelocations are loaded. This may change in the future for caching reasons.
     *
     * @type {Promise<Array<FrameLocation>>}
     */
    this._frameLocations = this._loadFrameLocations();

    this._switchActiveFrame(1);
  }

  _initializeWorkflows() {
    this._metaLabelWorkflow = new MetaLabelWorkflow(this.$scope);
    this._objectLabelWorkflow = new ObjectLabelWorkflow(this.$scope);
  }

  /**
   * Load all framelocations, which belong to the current task
   *
   * @returns {Promise<Array<FrameLocation>>}
 * @private
   */
  _loadFrameLocations() {
    const totalFrameCount = this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber + 1;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'source', 0, totalFrameCount);
  }

  /**
   * Fetch the frame image corresponding to the given frame number
   *
   * The frame number is 1-indexed
   *
   * @param frameNumber
   * @returns {Promise<HTMLImageElement>}
   * @private
   */
  _loadFrameImage(frameNumber) {
    return this._frameLocations.then(
      frameLocations => this._frameGateway.getImage(frameLocations[frameNumber - 1])
    );
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
   * Load the {@link LabeledFrame} structure for the given frame
   * @param frameNumber
   * @returns {Promise<LabeledFrame>}
   * @private
   */
  _loadLabeledFrame(frameNumber) {
    return this._labeledFrameGateway.getLabeledFrame(this.task.id, frameNumber);
  }

  _switchActiveFrame(frameNumber) {
    //this._switchToPlaceholderImage();
    this._clearLabelsAndThingsInFrame();
    this._initializeWorkflows();

    this._frameNumber = frameNumber;

    Promise.all([
      this._loadFrameImage(frameNumber),
      this._loadLabeledThingsInFrame(frameNumber),
      this._loadLabeledFrame(frameNumber),
    ]).then(([frameImage, labeledThingsInFrame, labeledFrame]) => {
      this.$scope.$apply(() => {
        this.frameImage = frameImage;
        this.labelsAndThingsInFrame.things = {};
        labeledThingsInFrame.forEach(
          labeledThing => this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing
        );

        this._labeledFrame = labeledFrame;
        this.metaLabelContext = this.createLabelObjectContextFromArray(this.metaLabelStructure, labeledFrame.classes);
      });
    });
  }

  createLabelObjectContextFromArray(structure, context) {
    const annotatedLinearLabelStructure = this._linearVisitor.visit(structure, context);
    return this._selectedLabelObjectVisitor.visit(annotatedLinearLabelStructure);
  }

  /**
   * Clear the currently active labels and things in a frame
   *
   * @private
   */
  _clearLabelsAndThingsInFrame() {
    this.labelsAndThingsInFrame = {
      labels: [],
      things: {},
    };

    this._activeLabeledThingInFrame = null;
    this.hideObjectLabels = true;
  }

  /**
   * Switch the active image over to the placeholder image
   *
   * @private
   */
  _switchToPlaceholderImage() {
    this.frameImage = this._placeholderImage;
  }

  handleNewThing(shapes) {
    this._activeLabeledThingInFrame = {
      frameNumber: this._frameNumber,
      shapes,
      classes: Object.values(this.objectLabelContext),
    };

    this._objectLabelWorkflow.transition('new-thing');
  }

  handleUpdatedThing(labeledThing) {
    this.handleSelectedThing(labeledThing); // @TODO: Temporary fix for incorrect selection handling
    this._objectLabelWorkflow.transition('edit-thing');
  }

  handleSelectedThing(labeledThing) {
    this._initializeWorkflows(); // @TODO: properly integrate change with handling
    this._activeLabeledThingInFrame = labeledThing;
    this.$scope.$apply(
      () => this._objectLabelWorkflow.transition('edit-labeled-thing', labeledThing)
    );
  }

  handleDeselectedThing() {
    this._activeLabeledThingInFrame = null;
    this.$scope.$apply(() => {
      this.hideObjectLabels = true;
    });
  }

  handleNextFrameRequested() {
    if (this._frameNumber >= this.task.frameRange.endFrameNumber) {
      return;
    }
    this._switchActiveFrame(this._frameNumber + 1);
  }

  handlePreviousFrameRequested() {
    if (this._frameNumber <= this.task.frameRange.startFrameNumber) {
      return;
    }
    this._switchActiveFrame(this._frameNumber - 1);
  }

  handleNewLabeledThingRequested() {
    this._initializeWorkflows(); // @TODO: properly integrate change with handling
    this._objectLabelWorkflow.transition('new-labeled-thing');
  }

  handleNewEllipseRequested() {
    this.activeTool = 'ellipse';
  }

  handleNewCircleRequested() {
    this.activeTool = 'circle';
  }

  handleNewPolygonRequested() {
    console.log('polygon');
    this.activeTool = 'polygon';
  }

  handleNewLineRequested() {
    console.log('line');
    this.activeTool = 'line';
  }
}

TaskController.$inject = [
  '$scope',
  'task',
  'labeledThingInFrameGateway',
  'labeledFrameGateway',
  'taskFrameLocationGateway',
  'frameGateway',
  'linearLabelStructureVisitor',
  'selectedLabelObjectLabelStructureVisitor',
  'selectedLabelListLabelStructureVisitor',
];


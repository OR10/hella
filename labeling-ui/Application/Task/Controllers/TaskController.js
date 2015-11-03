import metaLabelStructure from 'Tests/Fixtures/meta-label-structure.json!';
import metaLabelAnnotation from 'Tests/Fixtures/meta-label-structure-ui-annotation.json!';
import objectLabelStructure from 'Tests/Fixtures/object-label-structure.json!';
import objectLabelAnnotation from 'Tests/Fixtures/object-label-structure-ui-annotation.json!';


export default class TaskController {
  /**
   * @param {angular.Scope} $scope
   * @param {Task} task
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {FrameGateway} frameGateway
   */
  constructor($scope, task, labeledThingInFrameGateway, taskFrameLocationGateway, frameGateway) {
    /**
     * @type {angular.Scope}
     */
    this.$scope = $scope;

    /**
     * @type {LabeledThingInFrameGateway}
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {TaskFrameLocationGateway}
     */
    this._taskFrameLocationGateway = taskFrameLocationGateway;

    /**
     * @type {FrameGateway}
     */
    this._frameGateway = frameGateway;

    /**
     * Default placeholder image, which is used whenever a current image is not available
     * @type {HTTPImageElement}
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


  /**
   * Load all framelocations, which belong to the current task
   *
   * @returns {Promise<Array<FrameLocation>>}
   * @private
   */
  _loadFrameLocations() {
    const totalFrameCount = this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber;
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

  _switchActiveFrame(frameNumber) {
    this._switchToPlaceholderImage();
    this._clearLabelsAndThingsInFrame();

    this._frameNumber = frameNumber;

    Promise.all([
      this._loadFrameImage(frameNumber),
      this._loadLabeledThingsInFrame(frameNumber),
    ]).then(([frameImage, labeledThingsInFrame]) => {
      this.$scope.$apply(() => {
        this.frameImage = frameImage;
        this.labelsAndThingsInFrame.things = {};
        labeledThingsInFrame.forEach(
          labeledThing => this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing
        );
      });
    });
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
  }

  /**
   * Switch the active image over to the placeholder image
   *
   * @private
   */
  _switchToPlaceholderImage() {
    this.frameImage = this._placeholderImage;
  }

  handleMetaLabelingChanged(classes, incomplete) {
    console.log("handleMetaLabelingChanged: ", arguments);
  }

  handleObjectLabelingChanged(classes, incomplete) {
    console.log("handleObjectLabelingChanged: ", arguments);
  }

  handleNewThing(shapes) {
    this._labeledThingInFrameGateway.createLabeledThingInFrame(
      this.task,
      this._frameNumber,
      {shapes}
    )
    .then(labeledThing => this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing);
  }

  handleUpdatedThing(labeledThing) {
    this._labeledThingInFrameGateway.updateLabeledThingInFrame(labeledThing)
      .then(labeledThing => this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing);
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
}

TaskController.$inject = [
  '$scope',
  'task',
  'labeledThingInFrameGateway',
  'taskFrameLocationGateway',
  'frameGateway',
];


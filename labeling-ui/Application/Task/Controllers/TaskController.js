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
     */
    this.frameNumber = 1;

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

    $scope.$watch('vm.frameNumber', newFrameNumber => {
      this.frameImage = this._placeholderImage;
      Promise.all([
        this._loadFrameImage(newFrameNumber),
        this._loadLabeledThingsInFrame(newFrameNumber)
      ]).then(([frameImage, labeledThingsInFrame]) => {
        $scope.$apply(() => {
          this.frameImage = frameImage;
          this.labelsAndThingsInFrame.things = {};
          labeledThingsInFrame.forEach(
            labeledThing => this.labelsAndThingsInFrame.things[labeledThing.id] = labeledThing
          );
        });
      });
    });

    /**
     * List of frame location information for this task.
     *
     * Currently all framelocations are loaded. This may change in the future for caching reasons.
     *
     * @type {Promise<Array<FrameLocation>>}
     */
    this._frameLocations = this._loadFrameLocations();
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

  handleMetaLabelingChanged(classes, incomplete) {
    console.log("handleMetaLabelingChanged: ", arguments);
  }

  handleObjectLabelingChanged(classes, incomplete) {
    console.log("handleObjectLabelingChanged: ", arguments);
  }

  handleNewAnnotation(id, annotation) {
    this._labeledThingInFrameGateway.createLabeledThingInFrame(
      this.task,
      this.frameNumber,
      annotation
    )
    .then(labeledThing => this.labelsAndThingsInFrame.things[id] = labeledThing);
  }

  handleUpdatedAnnotation(id, annotation) {
    this._labeledThingInFrameGateway.updateLabeledThingInFrame(annotation)
      .then(labeledThing => this.labelsAndThingsInFrame.things[id] = labeledThing);
  }
}

TaskController.$inject = [
  '$scope',
  'task',
  'labeledThingInFrameGateway',
  'taskFrameLocationGateway',
  'frameGateway'
];


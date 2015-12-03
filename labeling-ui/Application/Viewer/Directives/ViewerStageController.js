import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * @class ViewerStageController
 *
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {Array.<LabeledThing> labeledThings
 * @property {LabeledThingInFrame} selectedLabeledThingInFrame
 * @property {string} activeTool
 * @property {Filters} filters
 */
class ViewerStageController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {DrawingContextService} drawingContextService
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {FrameGateway} frameGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {EntityIdService} entityIdService
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {Object} applicationConfig
   * @param {$interval} $interval
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor(
    $scope,
    $element,
    drawingContextService,
    taskFrameLocationGateway,
    frameGateway,
    labeledThingInFrameGateway,
    entityIdService,
    paperShapeFactory,
    applicationConfig,
    $interval,
    labeledThingGateway,
    abortablePromiseFactory
  ) {
    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['source', 'sourceJpg'];

    /**
     * The currently selected Shape
     *
     * @type {Shape|null}
     */
    this.selectedShape = null;

    /**
     * The ghosted LabeledThingInFrame, if one exists for the current selection and frame
     *
     * @type {LabeledThingInFrame|null}
     */
    this.ghostedLabeledThingInFrame = null;

    /**
     * @type {angular.Scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {TaskFrameLocationGateway}
     * @private
     */
    this._taskFrameLocationGateway = taskFrameLocationGateway;

    /**
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {Object}
     * @private
     */
    this._applicationConfig = applicationConfig;

    /**
     * @type {$interval}
     * @private
     */
    this._$interval = $interval;

    /**
     * @type {Promise|null}
     * @private
     */
    this._renderLoopPromise = null;

    /**
     * @type {boolean}
     * @private
     */
    this._frameChangeInProgress = false;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {LayerManager}
     * @private
     */
    this._layerManager = new LayerManager();

    // Store a reference to the LayerManager for E2E tests.
    // NEVER USE THIS INSIDE PRODUCTION CODE!
    $element[0].__endToEndTestOnlyLayerManager__ = this._layerManager;

    /**
     * Promise providing a list of all {@link FrameLocation}s corresponding to the given task
     *
     * The list will be requested upon initialization of the directive and should be available
     * quite fast.
     *
     * @type {Promise.<Array.<FrameLocation>>}
     * @private
     */
    this._frameLocations = this._loadFrameLocations();

    /**
     * RingBuffer to ensure only the last requested Background image is loaded
     *
     * @type {AbortablePromiseRingBuffer}
     */
    this._backgroundBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * RingBuffer to ensure only the last requested ghost {@link LabeledThingInFrame} is loaded
     *
     * @type {AbortablePromiseRingBuffer}
     */
    this._ghostedLabeledThingInFrameBuffer = new AbortablePromiseRingBuffer(1);

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

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer($scope.$new(), drawingContextService, paperShapeFactory);
    this._backgroundLayer = new BackgroundLayer($scope.$new(), drawingContextService);

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    this._backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('shape:new', shape => this._onNewShape(shape));
    thingLayer.on('shape:update', shape => this._onUpdatedShape(shape));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', thingLayer);
    this._layerManager.addLayer('background', this._backgroundLayer);


    $scope.$watch('vm.activeTool', newActiveTool => {
      thingLayer.activateTool(newActiveTool);
    });

    $scope.$watch('vm.selectedLabeledThingInFrame', () => {
      this.ghostedLabeledThingInFrame = null;
    });

    // Reapply filters if they changed
    $scope.$watchCollection('vm.filters.filters', filters => {
      this._backgroundLayer.resetLayer();
      filters.forEach(filter => {
        this._backgroundLayer.applyFilter(filter);
      });
      this._backgroundLayer.render();
    });


    // Update the Background once the `framePosition` changes
    // Update the possibly ghosted LabeledThingInFrame
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._handleFrameChange(newPosition);
    });

    // Update selectedLabeledThingInFrame once a shape is selected
    $scope.$watch('vm.selectedShape', (newSelectedShape) => {
      if (newSelectedShape === null) {
        this.selectedLabeledThingInFrame = null;
        this.selectedLabeledThing = null;
        this.ghostedLabeledThingInFrame = null;
      } else {
        if (this.ghostedLabeledThingInFrame !== null && newSelectedShape.labeledThingInFrame.id === this.ghostedLabeledThingInFrame.id) {
          return;
        }

        // As we do change from a ghost to a non ghost we can simply set this to null
        // If the change is executed between to non ghosts the null is just what was already set anyway.
        this.ghostedLabeledThingInFrame = null;
        this.selectedLabeledThingInFrame = this.labeledThingsInFrame[newSelectedShape.labeledThingInFrame.id];
        this.selectedLabeledThing = this.labeledThings[this.selectedLabeledThingInFrame.labeledThing.id];
      }
    });

    $scope.$watch('vm.playing', (playingNow, playingBefore) => {
      if (playingNow === playingBefore) {
        return;
      }

      if (playingNow) {
        this._startPlaying();
        return;
      }

      this._stopPlaying();
    });

    $scope.$on('destroy', () => {
      if (this._renderLoopPromise) {
        this._$interval.cancel(this._renderLoopPromise);
      }
    });
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
    if (this._frameChangeInProgress) {
      console.warn('frame change already in progress');
    }

    this._frameChangeInProgress = true;
    const frameChangePromises = [];

    const backgroundPromise = this._backgroundBuffer.add(
      this._loadFrameImage(frameNumber)
    ).then(newFrameImage => {
      this._backgroundLayer.setBackgroundImage(newFrameImage);
      this.filters.filters.forEach(filter => {
        this._backgroundLayer.applyFilter(filter);
      });
      this._backgroundLayer.render();
    });

    frameChangePromises.push(backgroundPromise);

    this.labeledThingsInFrame = null;
    this.labeledFrame = null;

    const labeledThingsInFramePromise = this._labeledThingInFrameBuffer.add(
      this._loadLabeledThingsInFrame(frameNumber)
      )
      .then(labeledThingsInFrame => {
        this.labeledThingsInFrame = {};
        this.labeledThings = {};

        labeledThingsInFrame.forEach(labeledThingInFrame => {
          this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
          this.labeledThings[labeledThingInFrame.labeledThing.id] = labeledThingInFrame.labeledThing;
        });
      });

    frameChangePromises.push(labeledThingsInFramePromise);


    if (this.selectedLabeledThingInFrame !== null) {
      const ghostUpdatePromise = this._ghostedLabeledThingInFrameBuffer.add(
        this._labeledThingInFrameGateway.getLabeledThingInFrame(
          this.task,
          frameNumber,
          this.selectedLabeledThingInFrame.labeledThing
        )
      ).then(labeledThingsInFrame => {
        const ghostedLabeledThingsInFrame = labeledThingsInFrame.filter(item => item.ghost === true);
        if (ghostedLabeledThingsInFrame.length === 0) {
          // The labeledThingInFrame is not ghosted and will automatically be loaded during the basic labeledThingInFrame request
          return;
        }

        this.ghostedLabeledThingInFrame = ghostedLabeledThingsInFrame[0];
      });

      frameChangePromises.push(ghostUpdatePromise);
    }

    Promise.all(frameChangePromises).then(() => {
      this._frameChangeInProgress = false;
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
   * Load all {@link FrameLocation}s corresponding to the assigned Task
   *
   * @returns {AbortablePromise<Array<FrameLocation>>}
   * @private
   */
  _loadFrameLocations() {
    const imageTypes = this.task.requiredImageTypes.filter((imageType) => {
      return (this._supportedImageTypes.indexOf(imageType) !== -1);
    });
    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }
    const totalFrameCount = this.framePosition.endFrameNumber - this.framePosition.startFrameNumber + 1;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], 0, totalFrameCount);
  }

  /**
   * Fetch the frame image corresponding to the given frame number
   *
   * The frame number is 1-indexed
   *
   * @param frameNumber
   * @returns {AbortablePromise<HTMLImageElement>}
   * @private
   */
  _loadFrameImage(frameNumber) {
    return this._frameLocations.then(
      frameLocations => this._frameGateway.getImage(frameLocations[frameNumber - 1])
    );
  }

  _onUpdatedShape(shape) {
    let labeledThingInFrame = this.labeledThingsInFrame[shape.labeledThingInFrame.id];

    if (labeledThingInFrame === undefined) {
      // A ghost shape has been updated
      // Let's bust the ghost and add it to the normal selection of labeledthingsinframe
      labeledThingInFrame = this.ghostedLabeledThingInFrame.ghostBust(
        this._entityIdService.getUniqueId(),
        this.framePosition.position
      );

      shape.labeledThingInFrameId = labeledThingInFrame.id;

      this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
      this.ghostedLabeledThingInFrame = null;
      this.selectedLabeledThingInFrame = labeledThingInFrame;
    }

    // @TODO this needs to be fixed for supporting multiple shapes
    labeledThingInFrame.shapes[0] = shape.toJSON();

    this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
  }

  _onNewShape(shape) {
    this._$scope.$apply(() => {
      this.selectedLabeledThingInFrame.shapes.push(shape);
      this.activeTool = 'move';

      this._labeledThingInFrameGateway.saveLabeledThingInFrame(this.selectedLabeledThingInFrame);
    });
  }

  _playNext() {
    if (!this.playing) {
      this._stopPlaying();
      return;
    }

    let nextFramePosition = this.framePosition.position + 1;

    if (this._frameChangeInProgress) {
      console.warn(`Could not finish rendering, skipping ${this._applicationConfig.Viewer.frameSkip} frames...`);
      this._frameChangeInProgress = false;
      nextFramePosition += this._applicationConfig.Viewer.frameSkip;
    }

    if (nextFramePosition <= this.framePosition.endFrameNumber) {
      this.framePosition.goto(nextFramePosition);
    } else {
      this._stopPlaying();
    }
  }

  _startPlaying() {
    this.framePosition.goto(this.framePosition.startFrameNumber);
    this._renderLoopPromise = this._$interval(
      this._playNext.bind(this),
      1000 / this._applicationConfig.Viewer.framesPerSecond
    );
  }

  _stopPlaying() {
    if (this._renderLoopPromise) {
      this._$interval.cancel(this._renderLoopPromise);
      this._renderLoopPromise = null;
      this.playing = false;
    }
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
  'taskFrameLocationGateway',
  'frameGateway',
  'labeledThingInFrameGateway',
  'entityIdService',
  'paperShapeFactory',
  'applicationConfig',
  '$interval',
  'labeledThingGateway',
  'abortablePromiseFactory',
];

export default ViewerStageController;

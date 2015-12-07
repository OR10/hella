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
 * @property {PaperShape} selectedPaperShape
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
   * @param {angular.$q} $q
   */
  constructor($scope,
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
              abortablePromiseFactory,
              $q
  ) {
    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['source', 'sourceJpg'];

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
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

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
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

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
    const thingLayer = new ThingLayer($scope.$new(), drawingContextService, entityIdService, paperShapeFactory);
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

    // Reapply filters if they changed
    $scope.$watchCollection('vm.filters.filters', filters => {
      this._backgroundLayer.resetLayer();
      filters.forEach(filter => {
        this._backgroundLayer.applyFilter(filter);
      });
      this._backgroundLayer.render();
    });


    // Update the Background once the `framePosition` changes
    // Update selectedPaperShape across frame change
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._handleFrameChange(newPosition);
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

    this._$q.all([
      this._backgroundBuffer.add(this._loadFrameImage(frameNumber)),
      this._labeledThingInFrameBuffer.add(this._loadLabeledThingsInFrame(frameNumber)),
      this._fetchGhostedLabeledThingInFrame(frameNumber),
    ]).then(([newFrameImage, labeledThingsInFrame, ghostedLabeledThingInFrame]) => {
      this._frameChangeInProgress = false;
      this.labeledThingsInFrame = [];
      this.labeledFrame = null;

      // Update background
      this._backgroundLayer.setBackgroundImage(newFrameImage);
      this.filters.filters.forEach(filter => {
        this._backgroundLayer.applyFilter(filter);
      });
      this._backgroundLayer.render();

      // Update labeledThingsInFrame
      this.labeledThingsInFrame = this.labeledThingsInFrame.concat(labeledThingsInFrame);

      if (ghostedLabeledThingInFrame) {
        this.labeledThingsInFrame.push(ghostedLabeledThingInFrame);
      }
    });
  }

  /**
   * @param {int} frameNumber
   * @returns {Promise.<LabeledThingInFrame|null>}
   * @private
   */
  _fetchGhostedLabeledThingInFrame(frameNumber) {
    if (this.selectedPaperShape === null) {
      return Promise.resolve(null);
    }

    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    return this._ghostedLabeledThingInFrameBuffer.add(
      this._labeledThingInFrameGateway.getLabeledThingInFrame(
        this.task,
        frameNumber,
        selectedLabeledThing
      )
    ).then(labeledThingsInFrame => {
      const ghostedLabeledThingsInFrame = labeledThingsInFrame.filter(item => item.ghost === true);

      if (ghostedLabeledThingsInFrame.length > 0) {
        return ghostedLabeledThingsInFrame[0];
      }

      return null;
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
    const labeledThingInFrame = shape.labeledThingInFrame;
    if (labeledThingInFrame.ghost) {
      labeledThingInFrame.ghostBust(
        this._entityIdService.getUniqueId(),
        this.framePosition.position
      );
    }

    // @TODO this needs to be fixed for supporting multiple shapes
    //       Possible solution only store paperShapes in labeledThingsInFrame instead of json structures
    labeledThingInFrame.shapes[0] = shape.toJSON();

    this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
  }

  /**
   * Create a new {@link LabeledThingInFrame} with a corresponding {@link LabeledThing} and store both
   * {@link LabeledObject}s to the backend
   *
   * @returns {AbortablePromise.<LabeledThingInFrame>}
   * @private
   */
  _onNewShape(shape) {
    console.log('new shape: ', shape);

    const newLabeledThingInFrame = shape.labeledThingInFrame;
    const newLabeledThing = newLabeledThingInFrame.labeledThing;

    // Store the newly created hierarchy to the backend
    this._labeledThingGateway.saveLabeledThing(newLabeledThing)
      .then(() => this._labeledThingInFrameGateway.saveLabeledThingInFrame(newLabeledThingInFrame))
      .then(() => shape.publish());

    this._$scope.$apply(() => {
      this.activeTool = 'move';
    });
  }

  _calculatePlaybackStartPosition() {
    if (this.selectedPaperShape) {
      return this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameNumber;
    }

    return this.framePosition.startFrameNumber;
  }

  _calculatePlaybackEndPosition() {
    if (this.selectedPaperShape) {
      return this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameNumber;
    }

    return this.framePosition.endFrameNumber;
  }

  _playNext() {
    if (!this.playing) {
      this._stopPlaying();
      return;
    }

    const endPosition = this._calculatePlaybackEndPosition();
    let nextFramePosition = this.framePosition.position + 1;

    if (this._frameChangeInProgress) {
      console.warn(`Could not finish rendering, skipping ${this._applicationConfig.Viewer.frameSkip} frames...`);
      this._frameChangeInProgress = false;
      nextFramePosition += this._applicationConfig.Viewer.frameSkip;
    }

    if (nextFramePosition < endPosition) {
      this.framePosition.goto(nextFramePosition);
    } else {
      if (this.framePosition.position < endPosition) {
        this.framePosition.goto(endPosition);
      }

      this._stopPlaying();
    }
  }

  _startPlaying() {
    const startPosition = this._calculatePlaybackStartPosition();

    this.framePosition.goto(startPosition);

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
  '$q',
];

export default ViewerStageController;

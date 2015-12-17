import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import Viewport from '../Models/Viewport';
import paper from 'paper';

/**
 * @class ViewerController
 *
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape} selectedPaperShape
 * @property {string} activeTool
 * @property {Filters} filters
 * @property {boolean} hideLabeledThingsInFrame
 */
class ViewerController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {angular.window} $window
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
   * @param {AnimationFrameService} animationFrameService
   * @param {angular.$q} $q
   * @param {EntityColorService} entityColorService
   * @param {LoggerService} logger
   * @param {$timeout} $timeout
   */
  constructor($scope,
              $element,
              $window,
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
              animationFrameService,
              $q,
              entityColorService,
              logger,
              $timeout,
              applicationState
  ) {
    /**
     * Mouse cursor used, while hovering the viewer
     *
     * @type {string}
     */
    this.activeMouseCursor = null;

    /**
     * Mouse cursor used while hovering the viewer set by position inside the viewer
     *
     * This mouse cursor is overriden by the `activeMouseCursor`.
     *
     * @type {null}
     */
    this.actionMouseCursor = null;

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
     * @type {angular.element}
     * @private
     */
    this._$element = $element;

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
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;

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
     * @type {Tool|null}
     */
    this.activeTool = null;

    /**
     * Due to an action selected DrawingTool, which should be activated when appropriate.
     *
     * @type {string}
     */
    this.selectedDrawingTool = null;

    /**
     * A structure holding all LabeledThingInFrames for the currently active frame
     *
     * @type {Object<string|LabeledThingInFrame>|null}
     */
    this.labeledThingsInFrame = [];

    /**
     * A structure holding all LabeledThings for the currently active frame
     *
     * @type {Object<string|LabeledThing>|null}
     */
    this.labeledThings = null;

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

    /**
     * @type {HtmlElement}
     */
    this._layerContainer = $element.find('.layer-container');

    const {width, height} = this.video.metaData;
    this._contentWidth = width;
    this._contentHeight = height;

    const eventDelegationLayer = new EventDelegationLayer();
    this._thingLayer = new ThingLayer(width, height, $scope.$new(), drawingContextService, entityIdService, paperShapeFactory, entityColorService, logger, $timeout);
    this._backgroundLayer = new BackgroundLayer(width, height, $scope.$new(), drawingContextService);

    this._resizeDebounced = animationFrameService.debounce(() => this._resize());

    // TODO needs to be called on side element resize as well
    $window.addEventListener('resize', this._resizeDebounced);

    $scope.$on('$destroy', () => {
      $window.removeEventListener('resize', this._resizeDebounced);
    });

    const eventDelegationLayerElement = $element.find('.event-delegation-layer');
    eventDelegationLayer.attachToDom(eventDelegationLayerElement[0]);

    eventDelegationLayerElement.on('mousewheel', this._handleScroll.bind(this));
    eventDelegationLayerElement.on('mousedown', this._handleMouseDown.bind(this));
    eventDelegationLayerElement.on('mousemove', this._handleMouseMove.bind(this));
    eventDelegationLayerElement.on('mouseup', this._handleMouseUp.bind(this));
    eventDelegationLayerElement.on('mouseleave', this._handleMouseLeave.bind(this));

    this._thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    this._backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    // Something seemingly still resizes after this point. We simply bump
    // the resize to the next animation frame to avoid this.
    this._resizeDebounced();

    this._thingLayer.on('shape:new', shape => this._onNewShape(shape));
    this._thingLayer.on('shape:update', shape => this._onUpdatedShape(shape));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', this._thingLayer);
    this._layerManager.addLayer('background', this._backgroundLayer);


    $scope.$watch('vm.activeTool', newActiveTool => {
      this._thingLayer.activateTool(newActiveTool);
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

    $scope.$watchGroup([
      'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameNumber',
      'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameNumber',
    ], ([newStart, newEnd], [oldStart, oldEnd]) => {
      if (this._currentFrameRemovedFromFrameRange(oldStart, newStart, oldEnd, newEnd)) {
        // TODO this is still subject to a race condition. The LabeledThing model has changed here but
        // the change might not yet have arrived at the backend. Loading the (potentially) updated
        // LabeledThingInFrame data now might thus provide stale state.
        this._updateLabeledThingsInFrame();
      }
    });

    $scope.$watchGroup(['vm.viewport.zoom', 'vm.viewport.center'], ([newZoom, newCenter]) => {
      if (newZoom && newZoom !== this._backgroundLayer.zoom) {
        this._zoom(newZoom);
      }

      const currentCenter = this._backgroundLayer.center;
      if (newCenter && newCenter.x !== currentCenter.x && newCenter.y !== currentCenter.y) {
        this._panTo(newCenter);
      }
    });

    $scope.$on('destroy', () => {
      if (this._renderLoopPromise) {
        this._$interval.cancel(this._renderLoopPromise);
      }
    });

    applicationState.$watch('viewer.disabled', (viewerDisabled) => {
      this.viewerDisabled = viewerDisabled;
    });
  }

  zoomIn(focalPoint, zoomFactor) {
    this._backgroundLayer.zoomIn(focalPoint, zoomFactor);
    this._thingLayer.zoomIn(focalPoint, zoomFactor);

    this._updateViewport();
  }

  zoomOut(focalPoint, zoomFactor) {
    this._backgroundLayer.zoomOut(focalPoint, zoomFactor);
    this._thingLayer.zoomOut(focalPoint, zoomFactor);

    this._updateViewport();
  }

  _resize() {
    const viewerHeight = this._$element.outerHeight(true);
    const viewerWidth = this._$element.outerWidth(true);

    const fittedWidth = this._contentWidth / this._contentHeight * viewerHeight;
    const fittedHeight = this._contentHeight / this._contentWidth * viewerWidth;

    const layerContainerWidth = fittedWidth <= viewerWidth ? fittedWidth : viewerWidth;
    const layerContainerHeight = fittedWidth <= viewerWidth ? viewerHeight : fittedHeight;

    this._layerContainer.width(layerContainerWidth);
    this._layerContainer.height(layerContainerHeight);

    this._resizeLayers(layerContainerWidth, layerContainerHeight);
    this._updateViewport();
  }

  _resizeLayers(width, height) {
    this._backgroundLayer.resize(width, height);
    this._thingLayer.resize(width, height);
  }

  _updateViewport() {
    if (!this.viewport) {
      this.viewport = new Viewport(
        this._backgroundLayer.zoom,
        this._backgroundLayer.center,
        this._backgroundLayer.bounds
      );
    } else {
      this.viewport.center = this._backgroundLayer.center;
      this.viewport.zoom = this._backgroundLayer.zoom;
      this.viewport.bounds = this._backgroundLayer.bounds;
    }
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
      this._logger.warn('ViewerController', 'frame change already in progress');
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

  _updateLabeledThingsInFrame() {
    this._$q.all([
      this._labeledThingInFrameBuffer.add(
        this._loadLabeledThingsInFrame(this.framePosition.position)
      ),
      this._fetchGhostedLabeledThingInFrame(this.framePosition.position),
    ]).then(([labeledThingsInFrame, ghostedLabeledThingInFrame]) => {
      this.labeledThingsInFrame = [];

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
    const labeledThing = labeledThingInFrame.labeledThing;

    if (labeledThingInFrame.ghost) {
      labeledThingInFrame.ghostBust(
        this._entityIdService.getUniqueId(),
        this.framePosition.position
      );
    }

    // Update the frame range for the associated LabeledThing if we made a modification outside of it
    let labeledThingUpdatePromise = Promise.resolve();

    if (this.framePosition.position > labeledThing.frameRange.endFrameNumber) {
      labeledThing.frameRange.endFrameNumber = this.framePosition.position;

      labeledThingUpdatePromise = labeledThingUpdatePromise.then(() => {
        return this._labeledThingGateway.saveLabeledThing(labeledThing);
      });
    }

    if (this.framePosition.position < labeledThing.frameRange.startFrameNumber) {
      labeledThing.frameRange.startFrameNumber = this.framePosition.position;

      labeledThingUpdatePromise = labeledThingUpdatePromise.then(() => {
        return this._labeledThingGateway.saveLabeledThing(labeledThing);
      });
    }

    // @TODO this needs to be fixed for supporting multiple shapes
    //       Possible solution only store paperShapes in labeledThingsInFrame instead of json structures
    labeledThingInFrame.shapes[0] = shape.toJSON();

    labeledThingUpdatePromise.then(() => {
      this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
    });
  }

  /**
   * Create a new {@link LabeledThingInFrame} with a corresponding {@link LabeledThing} and store both
   * {@link LabeledObject}s to the backend
   *
   * @returns {AbortablePromise.<LabeledThingInFrame>}
   * @private
   */
  _onNewShape(shape) {
    const newLabeledThingInFrame = shape.labeledThingInFrame;
    const newLabeledThing = newLabeledThingInFrame.labeledThing;

    // Store the newly created hierarchy to the backend
    this._labeledThingGateway.saveLabeledThing(newLabeledThing)
      .then(() => this._labeledThingInFrameGateway.saveLabeledThingInFrame(newLabeledThingInFrame))
      .then(() => shape.publish());

    this.activeTool = null;
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
      this._logger.warn(
        'ViewerController',
        `Could not finish rendering, skipping ${this._applicationConfig.Viewer.frameSkip} frames...`
      );
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

  _currentFrameRemovedFromFrameRange(oldStart, newStart, oldEnd, newEnd) {
    const currentPosition = this.framePosition.position;
    let removedCurrentFramFromRange = false;

    if (oldStart !== undefined && newStart !== undefined && newStart !== oldStart) {
      if (newStart > oldStart && oldStart <= currentPosition && newStart > currentPosition) {
        removedCurrentFramFromRange = true;
      }
    }

    if (oldEnd !== undefined && newEnd !== undefined && newEnd !== oldEnd) {
      if (newEnd < oldEnd && oldEnd >= currentPosition && newEnd < currentPosition) {
        removedCurrentFramFromRange = true;
      }
    }

    return removedCurrentFramFromRange;
  }

  _handleScroll(event) {
    if (event.altKey) {
      const focalPoint = new paper.Point(event.offsetX, event.offsetY);

      if (event.deltaY < 0) {
        this._$scope.$apply(() => {
          this.zoomIn(focalPoint, 1.05);
        });
      } else if (event.deltaY > 0) {
        this._$scope.$apply(() => {
          this.zoomOut(focalPoint, 1.05);
        });
      }
    }
  }

  _handleMouseDown(event) {
    if (event.shiftKey) {
      this._dragging = true;
      this._lastKnownMousePosition = {x: event.offsetX, y: event.offsetY};
    }
  }

  _handleMouseMove(event) {
    if (this._dragging) {
      const deltaX = this._lastKnownMousePosition.x - event.offsetX;
      const deltaY = this._lastKnownMousePosition.y - event.offsetY;

      this._$scope.$apply(() => {
        this._panBy(deltaX, deltaY);
      });

      this._lastKnownMousePosition = {x: event.offsetX, y: event.offsetY};
    }
  }

  _handleMouseUp() {
    this._dragging = false;
  }

  _handleMouseLeave() {
    this._dragging = false;
  }

  _zoom(newZoom) {
    this._backgroundLayer.setZoom(newZoom);
    this._thingLayer.setZoom(newZoom);

    this._updateViewport();
  }

  _panTo(newCenter) {
    this._backgroundLayer.panTo(newCenter);
    this._thingLayer.panTo(newCenter);

    this._updateViewport();
  }

  _panBy(deltaX, deltaY) {
    this._backgroundLayer.panBy(deltaX, deltaY);
    this._thingLayer.panBy(deltaX, deltaY);

    this._updateViewport();
  }
}

ViewerController.$inject = [
  '$scope',
  '$element',
  '$window',
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
  'animationFrameService',
  '$q',
  'entityColorService',
  'loggerService',
  '$timeout',
  'applicationState',
];

export default ViewerController;

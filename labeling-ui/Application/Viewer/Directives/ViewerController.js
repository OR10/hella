import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';
import CrosshairsLayer from '../Layers/CrosshairsLayer';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import Viewport from '../Models/Viewport';
import paper from 'paper';
import Environment from '../../Common/Support/Environment';

/**
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {PaperShape|null} selectedPaperShape
 * @property {string} activeTool
 * @property {string} selectedDrawingTool
 * @property {Task} task
 * @property {Video} video
 * @property {FramePosition} framePosition
 * @property {Filters} filters
 * @property {boolean} playing
 * @property {number} playbackSpeedFactor
 * @property {string} playbackDirection
 * @property {Viewport} viewport
 * @property {boolean} hideLabeledThingsInFrame
 * @property {string} multiTool
 * @property {integer} bookmarkedFrameIndex
 * @property {integer} fps
 * @property {integer} frameSkip
 * @property {ThingLayer} thingLayer
 * @property {boolean} readOnly
 * @property {boolean} showCrosshairs
 */
class ViewerController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$rootScope} $rootScope
   * @param {angular.element} $element
   * @param {angular.window} $window
   * @param {$injector} $injector
   * @param {DrawingContextService} drawingContextService
   * @param {FrameLocationGateway} frameLocationGateway
   * @param {FrameGateway} frameGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
   * @param {CacheHeaterService} cacheHeater
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
   * @param {Object} applicationState
   * @param {LockService} lockService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ToolService} toolService
   * @param {DebouncerService} debouncerService
   * @param {FrameIndexService} frameIndexService
   * @param {ModalService} modalService
   * @param {$state} $state
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   */
  constructor($scope,
              $rootScope,
              $element,
              $window,
              $injector,
              drawingContextService,
              frameLocationGateway,
              frameGateway,
              labeledThingInFrameGateway,
              labeledThingGroupGateway,
              cacheHeater,
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
              applicationState,
              lockService,
              keyboardShortcutService,
              toolService,
              debouncerService,
              frameIndexService,
              modalService,
              $state,
              viewerMouseCursorService) {
    /**
     * Mouse cursor used while hovering the viewer set by position inside the viewer
     *
     * @type {null}
     */
    this.actionMouseCursor = null;

    /**
     * @type {DrawingContextService}
     * @private
     */
    this._drawingContextService = drawingContextService;

    /**
     * @type {PaperShapeFactory}
     * @private
     */
    this._paperShapeFactory = paperShapeFactory;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {$injector}
     * @private
     */
    this._$injector = $injector;

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
     * @type {angular.$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {angular.element}
     * @private
     */
    this._$element = $element;

    /**
     * @type {FrameLocationGateway}
     * @private
     */
    this._frameLocationGateway = frameLocationGateway;

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
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;

    /**
     * @type {CacheHeaterService}
     * @private
     */
    this._cacheHeater = cacheHeater;

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
     * @type {LockService}
     * @private
     */
    this._lockService = lockService;

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {ToolService}
     * @private
     */
    this._toolService = toolService;

    /**
     * @type {DebouncerService}
     * @private
     */
    this._debouncerService = debouncerService;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {LayerManager}
     * @private
     */
    this._layerManager = new LayerManager();

    /**
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    this._viewerMouseCursorService.on('cursor:updated', cursor => {
      this.actionMouseCursor = cursor;
    });

    /**
     * @type {Debouncer}
     * @private
     */
    this._debouncedOnShapeUpdate = this._debouncerService.multiplexDebounce(
      (shape, frameIndex) => this._onUpdatedShape(shape, frameIndex),
      (shape, frameIndex) => shape.labeledThingInFrame.ghost
        ? `${frameIndex}.${shape.id}`
        : `${shape.labeledThingInFrame.frameIndex}.${shape.id}`,
      500
    );

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
     * @type {Object}
     * @private
     */
    this._applicationState = applicationState;

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


    /**
     * Show a modal if the camera calibration data is missing but needed for a 3d drawing task
     */
    if (this.task.drawingTool === 'cuboid' && !this.video.calibration) {
      this._modalService.info(
        {
          title: 'Missing calibration data',
          headline: 'This task is missing its camera calibration data. Please contact the label coordinator for further assistance!',
          confirmButtonText: 'Go back to project list',
        },
        () => {
          this._$state.go('labeling.tasks.list', {projectId: this.task.projectId});
        },
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
      return;
    }

    const {width, height} = this.video.metaData;
    this._contentWidth = width;
    this._contentHeight = height;

    this.setupLayers();

    this._resizeDebounced = animationFrameService.debounce(() => this._resize());

    // Something seemingly still resizes after this point. We simply bump
    // the resize to the next animation frame to avoid this.
    $scope.$evalAsync(() => this._resizeDebounced());

    $window.addEventListener('resize', this._resizeDebounced);

    const onVisibilityChange = () => {
      if ($window.document.visibilityState === 'visible') {
        this._resizeDebounced();
      }
    };

    $window.document.addEventListener('visibilitychange', onVisibilityChange);

    $scope.$on(
      '$destroy', () => {
        $window.removeEventListener('resize', this._resizeDebounced);
        $window.removeEventListener('visibilitychange', onVisibilityChange);
      }
    );

    // Register keyboard shortcuts
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '+',
      description: 'Zoom in',
      callback: () =>
        $scope.$applyAsync(() => this.zoomIn(null, 1.2)),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '-',
      description: 'Zoom out',
      callback: () =>
        $scope.$applyAsync(() => this.zoomOut(null, 1.2)),
    });

    const keyboardMovementSpeed = 30;

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'w',
      description: 'Move viewport up',
      callback: () =>
        $scope.$applyAsync(() => this._panBy(0, keyboardMovementSpeed * -1)),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 's',
      description: 'Move viewport down',
      callback: () =>
        $scope.$applyAsync(() => this._panBy(0, keyboardMovementSpeed)),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'a',
      description: 'Move viewport left',
      callback: () =>
        $scope.$applyAsync(() => this._panBy(keyboardMovementSpeed * -1, 0)),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'd',
      description: 'Move viewport right',
      callback: () =>
        $scope.$applyAsync(() => this._panBy(keyboardMovementSpeed, 0)),
    });

    // Update the Background once the `framePosition` changes
    // Update selectedPaperShape across frame change
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._debouncedOnShapeUpdate.triggerImmediately().then(() => this._handleFrameChange(newPosition));
    });

    $scope.$watch(
      'vm.playing', (playingNow, playingBefore) => {
        if (playingNow === playingBefore) {
          return;
        }

        if (playingNow) {
          this._startPlaying();
          return;
        }

        this._stopPlaying();
      }
    );

    $scope.$watch('vm.selectedPaperShape', newShape => {
      if (newShape && !newShape.isDraft) {
        this._cacheHeater.heatLabeledThingInFrame(newShape.labeledThingInFrame);
      }
    });

    $scope.$watchGroup(
      [
        'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex',
        'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameIndex',
      ],
      ([newStart, newEnd], [oldStart, oldEnd]) => {
        if (this._currentFrameRemovedFromFrameRange(oldStart, newStart, oldEnd, newEnd)) {
          const labeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

          // Synchronize operations on this LabeledThing
          this._lockService.acquire(labeledThing.id, release => {
            this._updateLabeledThingsInFrame()
              .then(release);
          });
        }
      }
    );

    const panViewportDebounced = animationFrameService.debounce(newCenter => this._panTo(newCenter));

    $scope.$watchGroup(
      ['vm.viewport.zoom', 'vm.viewport.center'], ([newZoom, newCenter]) => {
        if (newZoom && newZoom !== this._backgroundLayer.zoom) {
          this._zoom(newZoom);
        }

        const currentCenter = this._backgroundLayer.center;
        if (newCenter && (newCenter.x !== currentCenter.x || newCenter.y !== currentCenter.y)) {
          panViewportDebounced(newCenter);
        }
      }
    );

    $scope.$on(
      '$destroy', () => {
        if (this._renderLoopPromise) {
          this._$interval.cancel(this._renderLoopPromise);
        }
      }
    );

    applicationState.$watch(
      'viewer.isDisabled', viewerDisabled => this.viewerDisabled = viewerDisabled
    );

    applicationState.$watch(
      'viewer.isWorking', viewerWorking => this.viewerWorking = viewerWorking
    );

    applicationState.$watch(
      'viewer.isInFrameChange', inFrameChange => this.showBackdrop = !inFrameChange
    );

    $scope.$on(
      'sidebar.resized', () => {
        this._resizeDebounced();
      }
    );

    $scope.$on(
      'drawingtool:exception', (event, message) => {
        // This is needed to allow to tool to notice the pending mouse events
        this._$timeout(() => {
          this._modalService.info(
            {
              title: 'Error',
              headline: `There was an error in the drawing tool`,
              message,
              confirmButtonText: 'Understood',
            },
            undefined,
            undefined,
            {
              warning: true,
              abortable: false,
            }
          );
        }, 100);
      });

    // Initial prefetching of all frames
    if (this.task.taskType === 'object-labeling') {
      setTimeout(() => this._cacheHeater.heatFrames(this.task), 1000);
    }

    this.framePosition.beforeFrameChangeAlways('disableViewer', () => {
      this._applicationState.startFrameChange();
    });
    this.framePosition.afterFrameChangeAlways('disableViewer', () => {
      this._applicationState.endFrameChange();
    });

    /* *****************************************************************
     * START: Only executable in e2e tests
     * *****************************************************************/
    if (Environment.isTesting) {
      this.framePosition.afterFrameChangeOnce('testSetupApplicationReady', () => {
        window.__TEST_READY_PROMISE_RESOLVE();
      });
    }
    /* *****************************************************************
     * END: Only executable in e2e tests
     * *****************************************************************/
  }

  setupLayers() {
    this._setupEventDelegationLayer();

    this._setupBackgroundLayer();

    if (this.task.taskType === 'object-labeling') {
      this._setupThingLayer();
      this._setupCrosshairsLayer();
    }
  }

  _setupEventDelegationLayer() {
    const eventDelegationLayer = new EventDelegationLayer();
    const eventDelegationLayerElement = this._$element.find('.event-delegation-layer');
    eventDelegationLayer.attachToDom(eventDelegationLayerElement[0]);

    eventDelegationLayerElement.on('mousewheel', this._handleScroll.bind(this));
    eventDelegationLayerElement.on('mousedown', this._handleMouseDown.bind(this));
    eventDelegationLayerElement.on('mousemove', this._handleMouseMove.bind(this));
    eventDelegationLayerElement.on('mouseup', this._handleMouseUp.bind(this));
    eventDelegationLayerElement.on('mouseleave', this._handleMouseLeave.bind(this));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
  }

  _setupBackgroundLayer() {
    /**
     * @type {BackgroundLayer}
     * @private
     */
    this._backgroundLayer = new BackgroundLayer(
      this._contentWidth,
      this._contentHeight,
      this._$scope.$new(),
      this._drawingContextService
    );

    this._backgroundLayer.attachToDom(this._$element.find('.background-layer')[0]);

    // Reapply filters if they changed
    this._$scope.$watchCollection(
      'vm.filters.filters', filters => {
        this._backgroundLayer.resetLayer();
        filters.forEach(
          filter => {
            this._backgroundLayer.applyFilter(filter);
          }
        );
        this._backgroundLayer.render();
      }
    );

    this._layerManager.addLayer('background', this._backgroundLayer);
  }

  _setupCrosshairsLayer() {
    /**
     * @type {CrosshairsLayer}
     * @private
     */
    this._crosshairsLayer = new CrosshairsLayer(
      this._contentHeight,
      this._contentHeight,
      this._viewerMouseCursorService,
      '#bedb31', // $icon-hover (green)
      2
    );

    this._crosshairsLayer.attachToDom(this._$element.find('.crosshairs-layer')[0]);
    this._layerManager.addLayer('crosshairs', this._crosshairsLayer);
  }

  _setupThingLayer() {
    this.thingLayer = new ThingLayer(
      this._contentWidth,
      this._contentHeight,
      this._$scope.$new(),
      this._$injector,
      this._drawingContextService,
      this._paperShapeFactory,
      this._logger,
      this._$timeout,
      this.framePosition,
      this._viewerMouseCursorService
    );

    this.thingLayer.attachToDom(this._$element.find('.annotation-layer')[0]);

    this.thingLayer.on('shape:create', shape => this._onShapeCreate(shape));

    this.thingLayer.on('shape:update', shape => {
      const frameIndex = this.framePosition.position;
      this._debouncedOnShapeUpdate.debounce(shape, frameIndex);
    });

    this._layerManager.addLayer('annotations', this.thingLayer);

    this._$scope.$watchGroup(
      ['vm.activeTool', 'vm.selectedLabelStructureThing'],
      ([newActiveTool, newSelectedLabelStructureThings]) => {
        /* @TODO: Refactor (into service?!) to not have zoomPanel switch to 'multi'
         * while labelStructureThings are not loaded yet
         */
        if (newActiveTool === 'multi' && newSelectedLabelStructureThings === null) {
          return;
        }
        // Only called if all tools are initialized
        if (newActiveTool === null) {
          return;
        }

        this.thingLayer.activateTool(newActiveTool, newSelectedLabelStructureThings);
      }
    );
  }

  zoomIn(focalPoint, zoomFactor) {
    this._layerManager.forEachLayer(
      layer => {
        if (layer.zoomIn !== undefined) {
          layer.zoomIn(focalPoint, zoomFactor);
        }
      }
    );

    this._updateViewport();
  }

  zoomOut(focalPoint, zoomFactor) {
    this._layerManager.forEachLayer(
      layer => {
        if (layer.zoomIn !== undefined) {
          layer.zoomOut(focalPoint, zoomFactor);
        }
      }
    );

    this._updateViewport();
  }

  _resize() {
    const viewerHeight = this._$element.outerHeight(true);
    const viewerWidth = this._$element.outerWidth(true);

    const fittedWidth = this._contentWidth / this._contentHeight * viewerHeight;
    const fittedHeight = this._contentHeight / this._contentWidth * viewerWidth;

    let layerContainerWidth = fittedWidth <= viewerWidth ? fittedWidth : viewerWidth;
    let layerContainerHeight = fittedWidth <= viewerWidth ? viewerHeight : fittedHeight;

    /* *****************************************************************
     * START: Only executable in e2e tests
     * *****************************************************************/
    // Allow enforcement of viewer dimensions during tests
    if (Environment.isTesting && window.__TEST_OPTIONS !== undefined) {
      if (window.__TEST_OPTIONS.viewerWidth !== undefined &&
        window.__TEST_OPTIONS.viewerHeight !== undefined) {
        layerContainerWidth = parseInt(window.__TEST_OPTIONS.viewerWidth, 10);
        layerContainerHeight = parseInt(window.__TEST_OPTIONS.viewerHeight, 10);
      }
    }
    /* *****************************************************************
     * END: Only executable in e2e tests
     * *****************************************************************/

    this._layerContainer.width(layerContainerWidth);
    this._layerContainer.height(layerContainerHeight);

    this._resizeLayers(layerContainerWidth, layerContainerHeight);

    this.viewport = new Viewport(
      this._backgroundLayer.zoom,
      this._backgroundLayer.center,
      this._backgroundLayer.bounds
    );
  }

  _resizeLayers(width, height) {
    this._layerManager.forEachLayer(
      layer => {
        layer.resize(width, height);
      }
    );
  }

  _updateViewport() {
    this.viewport.center = this._backgroundLayer.center;
    this.viewport.zoom = this._backgroundLayer.zoom;
    this.viewport.bounds = this._backgroundLayer.bounds;
  }

  /**
   * Handle the change to new frame
   *
   * The frame change includes things like loading all frame relevant data from the backend,
   * as well as propagating this information to all subcomponents
   *
   * @param {int} frameIndex
   * @private
   */
  _handleFrameChange(frameIndex) {
    if (this._frameChangeInProgress) {
      this._logger.warn('ViewerController', 'frame change already in progress');
    }

    this.framePosition.lock.acquire();
    this._frameChangeInProgress = true;

    let abortRelease = false;

    const backendBufferPromise = this._backgroundBuffer.add(this._loadFrameImage(frameIndex))
      .aborted(() => {
        if (abortRelease) {
          return;
        }
        abortRelease = true;
        this.framePosition.lock.release();
      });

    const labeledThingInFrameBufferPromise = this._labeledThingInFrameBuffer.add(this._loadLabeledThingsInFrame(frameIndex))
      .aborted(() => {
        if (abortRelease) {
          return;
        }
        abortRelease = true;
        this.framePosition.lock.release();
      });


    this._$q.all(
      [
        backendBufferPromise,
        labeledThingInFrameBufferPromise,
        this._fetchGhostedLabeledThingInFrame(frameIndex),
      ]
    ).then(
      ([newFrameImage, labeledThingsInFrame, ghostedLabeledThingInFrame]) => {
        this._frameChangeInProgress = false;
        this.labeledThingsInFrame = [];
        this.labeledFrame = null;

        // Update background
        this._backgroundLayer.setBackgroundImage(newFrameImage);
        this.filters.filters.forEach(
          filter => {
            this._backgroundLayer.applyFilter(filter);
          }
        );
        this._backgroundLayer.render();

        // Update labeledThingsInFrame
        this.labeledThingsInFrame = this.labeledThingsInFrame.concat(labeledThingsInFrame);

        if (ghostedLabeledThingInFrame) {
          this.labeledThingsInFrame.push(ghostedLabeledThingInFrame);
        }
        this.framePosition.lock.release();
      }
    );
  }

  _updateLabeledThingsInFrame() {
    return this._$q.all(
      [
        this._labeledThingInFrameBuffer.add(
          this._loadLabeledThingsInFrame(this.framePosition.position)
        ),
        this._fetchGhostedLabeledThingInFrame(this.framePosition.position),
      ]
    ).then(
      ([labeledThingsInFrame, ghostedLabeledThingInFrame]) => {
        this.labeledThingsInFrame = [];

        // Update labeledThingsInFrame
        this.labeledThingsInFrame = this.labeledThingsInFrame.concat(labeledThingsInFrame);

        if (ghostedLabeledThingInFrame) {
          this.labeledThingsInFrame.push(ghostedLabeledThingInFrame);
        }
      }
    );
  }

  /**
   * @param {int} frameIndex
   * @returns {Promise.<LabeledThingInFrame|null>}
   * @private
   */
  _fetchGhostedLabeledThingInFrame(frameIndex) {
    if (this.selectedPaperShape === null) {
      return Promise.resolve(null);
    }

    const selectedLabeledThing = this.selectedPaperShape.labeledThingInFrame.labeledThing;

    return this._ghostedLabeledThingInFrameBuffer.add(
      this._labeledThingInFrameGateway.getLabeledThingInFrame(
        this.task,
        frameIndex,
        selectedLabeledThing
      )
    ).then(
      labeledThingsInFrame => {
        const ghostedLabeledThingsInFrame = labeledThingsInFrame.filter(item => item.ghost === true);

        if (ghostedLabeledThingsInFrame.length > 0) {
          return ghostedLabeledThingsInFrame[0];
        }

        return null;
      }
    );
  }

  /**
   * Load all {@link LabeledThingInFrame} for a corresponding frame
   *
   * The frameIndex is 0-Indexed
   *
   * @param {int} frameIndex
   * @returns {AbortablePromise<LabeledThingInFrame[]>}
   * @private
   */
  _loadLabeledThingsInFrame(frameIndex) {
    return this._labeledThingInFrameGateway.listLabeledThingInFrame(this.task, frameIndex);
  }

  /**
   * Load all {@link FrameLocation}s corresponding to the assigned Task
   *
   * @returns {AbortablePromise<Array<FrameLocation>>}
   * @private
   */
  _loadFrameLocations() {
    const imageTypes = this.task.requiredImageTypes.filter(
      imageType => {
        return (this._supportedImageTypes.indexOf(imageType) !== -1);
      }
    );
    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    const totalFrameCount = frameIndexLimits.upperLimit - frameIndexLimits.lowerLimit + 1;
    return this._frameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], 0, totalFrameCount);
  }

  /**
   * Fetch the frame image corresponding to the given frame number
   *
   * The frameIndex is 0-indexed
   *
   * @param frameIndex
   * @returns {AbortablePromise<HTMLImageElement>}
   * @private
   */
  _loadFrameImage(frameIndex) {
    return this._frameLocations.then(
      frameLocations => this._frameGateway.getImage(frameLocations[frameIndex])
    );
  }

  /**
   * @param {PaperShape} shape
   * @param {Integer} frameIndex
   * @private
   */
  _onUpdatedShape(shape, frameIndex) {
    const labeledThingInFrame = shape.labeledThingInFrame;
    const labeledThing = labeledThingInFrame.labeledThing;

    if (labeledThingInFrame.ghost) {
      labeledThingInFrame.ghostBust(
        this._entityIdService.getUniqueId(),
        frameIndex
      );
    }

    let frameRangeUpdated = false;

    if (frameIndex > labeledThing.frameRange.endFrameIndex) {
      labeledThing.frameRange.endFrameIndex = frameIndex;
      frameRangeUpdated = true;
    }

    if (frameIndex < labeledThing.frameRange.startFrameIndex) {
      labeledThing.frameRange.startFrameIndex = frameIndex;
      frameRangeUpdated = true;
    }

    if (frameRangeUpdated) {
      this._labeledThingGateway.saveLabeledThing(labeledThing);
    }

    // @TODO this needs to be fixed for supporting multiple shapes
    //       Possible solution only store paperShapes in labeledThingsInFrame instead of json structures
    labeledThingInFrame.shapes[0] = shape.toJSON();

    this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame).catch(() => {
      this._modalService.info(
        {
          title: 'Error',
          headline: `There was an error updating the shape`,
          message: `The shape could not be saved. Please contact the label coordinator and reload the page to continue with the labeling process!`,
          confirmButtonText: 'Reload',
        },
        () => window.location.reload(),
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
    });
  }

  /**
   * Create a new {@link LabeledThingInFrame} with a corresponding {@link LabeledThing} and store both
   * {@link LabeledObject}s to the backend
   *
   * @returns {AbortablePromise.<LabeledThingInFrame>}
   * @private
   */
  _onShapeCreate(shape) {
    this._$rootScope.$emit('shape:add:before');
    const newLabeledThingInFrame = shape.labeledThingInFrame;
    const newLabeledThing = newLabeledThingInFrame.labeledThing;

    // Store the newly created hierarchy to the backend
    this._labeledThingGateway.saveLabeledThing(newLabeledThing)
      .then(storedLabeledThing => {
        return this._labeledThingInFrameGateway.saveLabeledThingInFrame(newLabeledThingInFrame, storedLabeledThing.task.id);
      })
      .catch(() => {
        this._modalService.info(
          {
            title: 'Error',
            headline: `There was an error creating the shape`,
            message: `The shape could not be created. Please contact the label coordinator and reload the page to continue with the labeling process!`,
            confirmButtonText: 'Reload',
          },
          () => window.location.reload(),
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
      })
      .then(() => {
        shape.publish();
        this._$rootScope.$emit('shape:add:after', shape);
      });

    this.bookmarkedFrameIndex = this.framePosition.position;
  }

  _calculatePlaybackStartPosition() {
    if (this.selectedPaperShape && this.playbackSpeedFactor === 1) {
      return this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex;
    }

    return this._frameIndexService.getFrameIndexLimits().lowerLimit;
  }

  _calculatePlaybackEndPosition() {
    if (this.selectedPaperShape && this.playbackSpeedFactor === 1) {
      const limitingProperty = this.playbackDirection === 'forwards' ? 'endFrameIndex' : 'startFrameIndex';
      return this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange[limitingProperty];
    }

    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    return this.playbackDirection === 'forwards' ? frameIndexLimits.upperLimit : frameIndexLimits.lowerLimit;
  }

  _playNext() {
    if (!this.playing) {
      this._stopPlaying();
      return;
    }

    if (this.playbackDirection === 'forwards') {
      this._playNextForwards();
    } else {
      this._playNextBackwards();
    }
  }

  _playNextForwards() {
    const endPosition = this._calculatePlaybackEndPosition();
    const speedFactor = this.frameSkip ? parseInt(this.frameSkip, 10) : this.playbackSpeedFactor;

    let nextFramePosition = this.framePosition.position + speedFactor;

    if (this._frameChangeInProgress) {
      this._logger.warn(
        'ViewerController',
        `Could not finish rendering, skipping ${this._applicationConfig.Viewer.frameSkip * speedFactor} frames...`
      );
      this._frameChangeInProgress = false;
      nextFramePosition += this._applicationConfig.Viewer.frameSkip * speedFactor;
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

  _playNextBackwards() {
    const endPosition = this._calculatePlaybackEndPosition();
    const speedFactor = this.frameSkip ? parseInt(this.frameSkip, 10) : this.playbackSpeedFactor;

    let nextFramePosition = this.framePosition.position - speedFactor;

    if (this._frameChangeInProgress) {
      this._logger.warn(
        'ViewerController',
        `Could not finish rendering, skipping ${this._applicationConfig.Viewer.frameSkip * speedFactor} frames...`
      );
      this._frameChangeInProgress = false;
      nextFramePosition -= this._applicationConfig.Viewer.frameSkip * speedFactor;
    }

    if (nextFramePosition > endPosition) {
      this.framePosition.goto(nextFramePosition);
    } else {
      if (this.framePosition.position > endPosition) {
        this.framePosition.goto(endPosition);
      }

      this._stopPlaying();
    }
  }

  _startPlaying() {
    const fps = this.fps ? parseInt(this.fps, 10) : this._applicationConfig.Viewer.framesPerSecond;

    if (this.selectedPaperShape && this.playbackSpeedFactor === 1) {
      const startPosition = this._calculatePlaybackStartPosition();

      this.framePosition.goto(startPosition);
    }

    this._renderLoopPromise = this._$interval(
      this._playNext.bind(this),
      1000 / fps
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
    const focalPoint = new paper.Point(event.offsetX, event.offsetY);

    if (event.deltaY < 0) {
      this._$scope.$apply(
        () => {
          this.zoomOut(focalPoint, 1.05);
        }
      );
    } else if (event.deltaY > 0) {
      this._$scope.$apply(
        () => {
          this.zoomIn(focalPoint, 1.05);
        }
      );
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

      this._$scope.$apply(
        () => {
          this._panBy(deltaX, deltaY);
        }
      );

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
    this._layerManager.forEachLayer(
      layer => {
        if (layer.setZoom !== undefined) {
          layer.setZoom(newZoom);
        }
      }
    );

    this._updateViewport();
  }

  _panTo(newCenter) {
    this._layerManager.forEachLayer(
      layer => {
        if (layer.panTo !== undefined) {
          layer.panTo(newCenter);
        }
      }
    );

    this._updateViewport();
  }

  _panBy(deltaX, deltaY) {
    this._layerManager.forEachLayer(
      layer => {
        if (layer.panBy !== undefined) {
          layer.panBy(deltaX, deltaY);
        }
      }
    );

    this._updateViewport();
  }
}

ViewerController.$inject = [
  '$scope',
  '$rootScope',
  '$element',
  '$window',
  '$injector',
  'drawingContextService',
  'frameLocationGateway',
  'frameGateway',
  'labeledThingInFrameGateway',
  'labeledThingGroupGateway',
  'cacheHeaterService',
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
  'lockService',
  'keyboardShortcutService',
  'toolService',
  'debouncerService',
  'frameIndexService',
  'modalService',
  '$state',
  'viewerMouseCursorService',
];

export default ViewerController;

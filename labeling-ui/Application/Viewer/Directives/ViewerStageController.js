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
   */
  constructor($scope, $element, drawingContextService, taskFrameLocationGateway, frameGateway, labeledThingInFrameGateway) {
    /**
     * The currently selected Shape
     *
     * @type {Shape|null}
     */
    this.selectedShape = null;

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

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer($scope.$new(), drawingContextService);
    const backgroundLayer = new BackgroundLayer($scope.$new(), drawingContextService);

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('shape:new', shape => this._onNewShape(shape));
    thingLayer.on('thing:update', shape => this._onUpdatedShape(shape));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', thingLayer);
    this._layerManager.addLayer('background', backgroundLayer);


    $scope.$watch('vm.activeTool', newActiveTool => {
      thingLayer.activateTool(newActiveTool);
    });

    $scope.$watch('vm.labeledThingsInFrame', newLabeledThingsInFrame => {
      if (newLabeledThingsInFrame === null) {
        thingLayer.clear();
      } else {
        thingLayer.addLabeledThings(Object.values(newLabeledThingsInFrame));
      }
    });

    $scope.$watch('vm.selectedLabeledThingInFrame', (newThing) => {
      thingLayer.setSelectedLabeledThingInFrame(newThing);
    });

    // Reapply filters if they changed
    $scope.$watchCollection('vm.filters.filters', filters => {
      backgroundLayer.resetLayer();
      filters.forEach(filter => {
        backgroundLayer.applyFilter(filter);
      });
      backgroundLayer.render();
    });

    // Update the Background once the `framePosition` changes
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._backgroundBuffer.add(
        this._loadFrameImage(newPosition)
      ).then(newFrameImage => {
        backgroundLayer.setBackgroundImage(newFrameImage);
        this.filters.filters.forEach(filter => {
          backgroundLayer.applyFilter(filter);
        });
        backgroundLayer.render();
      });
    });

    // Update selectedLabeledThingInFrame once a shape is selected
    $scope.$watch('vm.selectedShape', (newShape) => {
      if (newShape === null) {
        this.selectedLabeledThingInFrame = null;
      } else {
        this.selectedLabeledThingInFrame = this.labeledThingsInFrame[newShape.labeledThingInFrameId];
      }
    });
  }

  /**
   * Load all {@link FrameLocation}s corresponding to the assigned Task
   *
   * @returns {Promise<Array<FrameLocation>>}
   * @private
   */
  _loadFrameLocations() {
    const totalFrameCount = this.framePosition.endFrameNumber - this.framePosition.startFrameNumber + 1;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'source', 0, totalFrameCount);
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

  _onSelectedThing(labeledThingInFrameId) {
    this._$scope.$apply(() => {
    });
  }

  _onUpdatedShape(labeledThingInFrameId, shape) {
    const labeledThingInFrame = this.labeledThingsInFrame[shape.labeledThingInFrameId];

    // @TODO this needs to be fixed for supporting multiple shapes
    labeledThingInFrame.shapes[0] = shape;

    this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
  }

  _onNewShape(shape) {
    this._$scope.$apply(() => {
      this.selectedLabeledThingInFrame.shapes.push(shape);
      this.activeTool = null;

      this._labeledThingInFrameGateway.saveLabeledThingInFrame(this.selectedLabeledThingInFrame);
    });
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
  'taskFrameLocationGateway',
  'frameGateway',
  'labeledThingInFrameGateway',
];

export default ViewerStageController;

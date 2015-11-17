import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
 *
 * @property {FramePosition} framePosition
 * @property {Task} task
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

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer(drawingContextService);
    const backgroundLayer = new BackgroundLayer(drawingContextService);

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('thing:new', shape => this._onNewShape(shape));
    thingLayer.on('thing:update', (labeledThingInFrameId, shape) => this._onUpdatedShape(labeledThingInFrameId, shape));
    thingLayer.on('thing:selected', labeledThingInFrameId => this._onSelectedThing(labeledThingInFrameId));
    thingLayer.on('thing:deselected', () => this._onDeselectedThing());

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
      this._loadFrameImage(newPosition).then(newFrameImage => {
        if (newPosition !== this.framePosition.position) {
          // The position changed while loading the frame
          // another frame is already requested. Skip this one.
          return;
        }

        backgroundLayer.setBackgroundImage(newFrameImage);
        this.filters.filters.forEach(filter => {
          backgroundLayer.applyFilter(filter);
        });
        backgroundLayer.render();
      });
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
   * @returns {Promise<HTMLImageElement>}
   * @private
   */
  _loadFrameImage(frameNumber) {
    return this._frameLocations.then(
      frameLocations => this._frameGateway.getImage(frameLocations[frameNumber - 1])
    );
  }

  _onDeselectedThing() {
    this._$scope.$apply(() => {
      this.selectedLabeledThingInFrame = null;
    });
  }

  _onSelectedThing(labeledThingInFrameId) {
    this._$scope.$apply(() => {
      this.selectedLabeledThingInFrame = this.labeledThingsInFrame[labeledThingInFrameId];
    });
  }

  _onUpdatedShape(labeledThingInFrameId, shape) {
    const labeledThingInFrame = this.labeledThingsInFrame[labeledThingInFrameId];

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

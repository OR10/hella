import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 * @property {Function} onSelectedThing
 * @property {Function} onDeselectedThing
 * @property {Array} filters
 *
 * @property {FramePosition} framePosition
 * @property {Task} task
 */
class ViewerStageController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {DrawingContextService} drawingContextService
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {FrameGateway} frameGateway
   */
  constructor($scope, $element, drawingContextService, taskFrameLocationGateway, frameGateway) {
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
    const backgroundLayer = new BackgroundLayer();

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('thing:new', shapes => this.onNewThing({shapes}));
    thingLayer.on('thing:update', labeledThing => this.onUpdatedThing({labeledThing}));
    thingLayer.on('thing:selected', labeledThing => this.onSelectedThing({labeledThing}));
    thingLayer.on('thing:deselected', () => this.onDeselectedThing());

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', thingLayer);
    this._layerManager.addLayer('background', backgroundLayer);

    $scope.$watch('vm.frameImage', newFrameImage => {
    });

    $scope.$watch('vm.activeTool', newActiveTool => {
      thingLayer.activateTool(newActiveTool);
    });

    $scope.$watchCollection('vm.thingsInFrame', newThingsInFrame => {
      thingLayer.clear();
      thingLayer.addLabeledThings(Object.values(newThingsInFrame));
    });

    $scope.$watchCollection('vm.filters', filters => {
      if (filters) {
        backgroundLayer.resetLayer();
        filters.forEach(filter => {
          backgroundLayer.applyFilter(filter);
        });
      }
    });

    // Update the Background once the `framePosition` changes
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._loadFrameImage(newPosition).then(newFrameImage => {
        if (newPosition != this.framePosition.position) {
          // The position changed while loading the frame
          // another frame is already requested. Skip this one.
          return;
        }

        backgroundLayer.setBackgroundImage(newFrameImage);
        backgroundLayer.render();
        this.filters.forEach(filter => {
          backgroundLayer.applyFilter(filter);
        });
      })
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

}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
  'taskFrameLocationGateway',
  'frameGateway',
];

export default ViewerStageController;

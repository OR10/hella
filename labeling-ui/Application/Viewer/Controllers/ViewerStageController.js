import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
 *
 * @property {Function} onNewThing
 * @property {Function} onUpdatedThing
 */
export default class ViewerStageController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {DrawingContextService} drawingContextService
   */
  constructor($scope, $element, drawingContextService) {
    this._layerManager = new LayerManager();

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer(drawingContextService);
    const backgroundLayer = new BackgroundLayer();

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('thing:new', this._handleNewThing.bind(this));
    thingLayer.on('thing:update', this._handleUpdatedThing.bind(this));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', thingLayer);
    this._layerManager.addLayer('background', backgroundLayer);

    $scope.$watch('vm.activeTool', (newTool, oldTool) => {
      if (newTool !== oldTool) {
        thingLayer.activateTool(newTool);
      }
    });

    $scope.$watch('vm.frameImage', newFrameImage => {
      backgroundLayer.setBackgroundImage(newFrameImage);
      backgroundLayer.render();
    });

    $scope.$watch('vm.thingsInFrame', newThingsInFrame => {
      thingLayer.clear();
      thingLayer.addThings(Object.values(newThingsInFrame));
    });
  }

  /**
   * @param {String} id - Internal management id
   * @param {LabeledThingInFrame} thing
   * @private
   */
  _handleNewThing(id, thing) {
    this.onNewThing({id, thing});
  }

  /**
   * @param {String} id - Internal management id
   * @param {LabeledThingInFrame} thing
   * @private
   */
  _handleUpdatedThing(id, thing) {
    this.onUpdatedThing({id, thing});
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
];

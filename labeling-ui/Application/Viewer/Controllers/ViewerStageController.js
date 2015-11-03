import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
 *
 * @property {Function} onNewAnnotation
 * @property {Function} onUpdatedAnnotation
 */
export default class ViewerStageController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {DrawingContextService} drawingContextService
   */
  constructor($scope, $element, drawingContextService) {
    this._$apply = $scope.$apply.bind($scope);
    this._layerManager = new LayerManager();

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer(drawingContextService);
    const backgroundLayer = new BackgroundLayer();

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('annotation:new', this._handleNewAnnotation.bind(this));
    thingLayer.on('annotation:update', this._handleUpdatedAnnotation.bind(this));

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
   * @param {String} annotationId - Internal management id
   * @param {LabeledThingInFrame} annotation
   * @private
   */
  _handleNewAnnotation(annotationId, annotation) {
    this._$apply(() => {
      this.activeTool = 'modification';
    });

    this.onNewAnnotation({annotation, id: annotationId});
  }

  /**
   * @param {String} annotationId - Internal management id
   * @param {LabeledThingInFrame} annotation
   * @private
   */
  _handleUpdatedAnnotation(annotationId, annotation) {
    this.onUpdatedAnnotation({annotation, id: annotationId});
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'drawingContextService',
];

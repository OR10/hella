import jquery from 'jquery';

import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import AnnotationLayer from '../Layers/AnnotationLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerController
 *
 */
export default class ViewerController {
  /**
   *
   * @param {angular.element} $element
   * @param {TaskFrameLocationService} taskFrameLocationService
   * @param {FrameService} frameService
   */
  constructor($element, taskFrameLocationService, frameService) {
    this._layerManager = new LayerManager();

    const eventDelegationLayer = new EventDelegationLayer();
    const annotationLayer = new AnnotationLayer();
    const backgroundLayer = new BackgroundLayer();


    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    annotationLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', annotationLayer);
    this._layerManager.addLayer('background', backgroundLayer);

    taskFrameLocationService.getFrameLocations(this.task.id, 'source')
      .then(frameLocations => {
        return frameService.getImage(frameLocations[0]);
      })
      .then(image => {
        backgroundLayer.setBackgroundImage(image);
        backgroundLayer.render();
      });
  }
}

ViewerController.$inject = ['$element', 'taskFrameLocationService', 'frameService'];

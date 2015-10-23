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
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {TaskFrameLocationService} taskFrameLocationService
   * @param {FrameService} frameService
   */
  constructor($scope, $element, taskFrameLocationService, frameService) {
    this._frameService = frameService;
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

    this._initializeFrameLocations(taskFrameLocationService, frameService, backgroundLayer);

    $scope.$watch('vm.frameNumber', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._setBackground();
      }
    });
  }

  _initializeFrameLocations(taskFrameLocationService, frameService, backgroundLayer) {
    return Promise.resolve()
      .then(() => {
        return taskFrameLocationService.getFrameLocations(
          this.task.id,
          'source',
          0,
          // TODO fix snake case as soon as backend api is fixed
          this.task.frame_range.end_frame_number - this.task.frame_range.start_frame_number
        );
      })
      .then(frameLocations => {
        this._frameLocations = frameLocations;
      })
      .then(() => {
        return frameService.getImage(this._frameLocations[this.frameNumber - 1]);
      })
      .then(image => {
        backgroundLayer.setBackgroundImage(image);
        backgroundLayer.render();
      });
  }

  _setBackground() {
    this._frameService.getImage(this._frameLocations[this.frameNumber - 1])
      .then(image => {
        const backgroundLayer = this._layerManager.getLayer('background');

        backgroundLayer.setBackgroundImage(image);
        backgroundLayer.render();
      });
  }
}

ViewerController.$inject = ['$scope', '$element', 'taskFrameLocationService', 'frameService'];

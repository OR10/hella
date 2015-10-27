import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import AnnotationLayer from '../Layers/AnnotationLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
 *
 */
export default class ViewerStageController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.element} $element
   * @param {TaskFrameLocationService} taskFrameLocationService
   * @param {FrameService} frameService
   * @param {DrawingContextService} drawingContextService
   * @param {LabelingDataService} labelingDataService
   */
  constructor($scope, $element, taskFrameLocationService, frameService, drawingContextService, labelingDataService) {
    this._frameService = frameService;
    this._layerManager = new LayerManager();
    this._labelingDataService = labelingDataService;

    const eventDelegationLayer = new EventDelegationLayer();
    const annotationLayer = new AnnotationLayer(drawingContextService);
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

        this._updateAnnotations(oldValue, newValue);
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
          this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber
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

  _updateAnnotations(oldFrameNumber, newFrameNuber) {
    const annotationLayer = this._layerManager.getLayer('annotations');
    const annotations = annotationLayer.getAnnotations();

    // TODO replace with LabeledThing model
    const labelingData = annotations;

    if (oldFrameNumber) {
      this._saveFrameLabelingData(oldFrameNumber, labelingData);
    }

    annotationLayer.clear();

    this._loadFrameLabelingData(newFrameNuber).then((frameLabelingData) => {
      // TODO extract labeling annotations
      annotationLayer.draw(frameLabelingData);
    });
  }

  _saveFrameLabelingData(frameNumber, labelingData) {
    return this._labelingDataService.updateLabeledThingsInFrame(this.task, frameNumber, labelingData);
  }

  _loadFrameLabelingData(frameNumber) {
    return this._labelingDataService.getLabeledThingsInFrame(this.task, frameNumber);
  }
}

ViewerStageController.$inject = ['$scope', '$element', 'taskFrameLocationService', 'frameService', 'drawingContextService', 'labelingDataService'];

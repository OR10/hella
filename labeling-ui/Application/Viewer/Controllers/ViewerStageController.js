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
    this._$scope = $scope;
    this._taskFrameLocationService = taskFrameLocationService;
    this._frameService = frameService;
    this._layerManager = new LayerManager();
    this._labelingDataService = labelingDataService;

    this._labelingData = [];

    const eventDelegationLayer = new EventDelegationLayer();
    const annotationLayer = new AnnotationLayer(drawingContextService);
    const backgroundLayer = new BackgroundLayer();

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    annotationLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    annotationLayer.on('annotation:new', this._onNewAnnotation.bind(this));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', annotationLayer);
    this._layerManager.addLayer('background', backgroundLayer);

    const frameLocationsPromise = this._initializeFrameLocations();

    $scope.$watch('vm.activeTool', (newTool, oldTool) => {
      if (newTool !== oldTool) {
        annotationLayer.activateTool(newTool);
      }
    });

    $scope.$watch('vm.frameNumber', (newFrameNumber, oldFrameNumber) => {
      frameLocationsPromise.then(() => {
        this._setBackground();
      });

      if (newFrameNumber !== oldFrameNumber) {
        this._updateAnnotations(newFrameNumber, oldFrameNumber);
      } else {
        this._updateAnnotations(newFrameNumber);
      }
    });
  }

  _initializeFrameLocations() {
    return Promise.resolve()
      .then(() => {
        return this._taskFrameLocationService.getFrameLocations(
          this.task.id,
          'source',
          0,
          this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber
        );
      })
      .then(frameLocations => {
        this._frameLocations = frameLocations;
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

  _updateAnnotations(newFrameNumber) {
    const annotationLayer = this._layerManager.getLayer('annotations');

    this._loadFrameLabelingData(newFrameNumber).then((frameLabelingData) => {
      annotationLayer.setAnnotations(frameLabelingData);
    });
  }

  _loadFrameLabelingData(frameNumber) {
    return this._labelingDataService.listLabeledThingInFrame(this.task, frameNumber);
  }

  /**
   * @param {String} annotationId - Internal management id
   * @param {LabeledThingInFrame} annotation
   * @private
   */
  _onNewAnnotation(annotationId, annotation) {
    this._$scope.$apply(() => {
      this.activeTool = 'modification';
    });

    this._labelingDataService.createLabeledThingInFrame(this.task, this.frameNumber, annotation)
      .then((labeledThingInFrame) => {
        const annotationLayer = this._layerManager.getLayer('annotations');
        annotationLayer.setAnnotation(annotationId, labeledThingInFrame);
      });
  }

  /**
   * @param {String} annotationId - Internal management id
   * @param {LabeledThingInFrame} annotation
   * @private
   */
  _onUpdatedAnnotation(annotationId, annotation) {
    this._labelingDataService.updateLabeledThingInFrame(this.task, this.frameNumber, annotation)
      .then((labeledThingInFrame) => {
        const annotationLayer = this._layerManager.getLayer('annotations');
        annotationLayer.setAnnotation(annotationId, labeledThingInFrame);
      });
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'taskFrameLocationService',
  'frameService',
  'drawingContextService',
  'labelingDataService',
];

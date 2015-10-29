import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import AnnotationLayer from '../Layers/AnnotationLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';

/**
 * @class ViewerStageController
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

    const eventDelegationLayer = new EventDelegationLayer();
    const annotationLayer = new AnnotationLayer(drawingContextService);
    const backgroundLayer = new BackgroundLayer();

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    annotationLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    annotationLayer.on('annotation:new', this._onNewAnnotation.bind(this));
    annotationLayer.on('annotation:update', this._onUpdatedAnnotation.bind(this));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', annotationLayer);
    this._layerManager.addLayer('background', backgroundLayer);

    const frameLocationsPromise = this._initializeFrameLocations();

    $scope.$watch('vm.activeTool', (newTool, oldTool) => {
      if (newTool !== oldTool) {
        annotationLayer.activateTool(newTool);
      }
    });

    $scope.$watch('vm.frameNumber', (newFrameNumber) => {
      frameLocationsPromise.then(() => {
        this._setBackground();
      });

      this._updateAnnotations(newFrameNumber);
    });
  }

  /**
   * @private
   *
   * @returns {Promise}
   */
  _initializeFrameLocations() {
    const totalFrameCount = this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber;

    return this._taskFrameLocationService.getFrameLocations(this.task.id, 'source', 0, totalFrameCount)
      .then(frameLocations => {
        this._frameLocations = frameLocations;
      });
  }

  /**
   * @private
   */
  _setBackground() {
    this._frameService.getImage(this._frameLocations[this.frameNumber - 1])
      .then(image => {
        const backgroundLayer = this._layerManager.getLayer('background');

        backgroundLayer.setBackgroundImage(image);
        backgroundLayer.render();
      });
  }

  /**
   * @param {int} newFrameNumber
   * @private
   */
  _updateAnnotations(newFrameNumber) {
    const annotationLayer = this._layerManager.getLayer('annotations');

    annotationLayer.clear();

    this._loadFrameLabelingData(newFrameNumber).then((frameLabelingData) => {
      annotationLayer.addAnnotations(frameLabelingData);
    });
  }

  /**
   * @param {int} frameNumber
   * @returns {Promise.<LabeledThingInFrame[]|Error>}
   * @private
   */
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
    this._labelingDataService.updateLabeledThingInFrame(annotation)
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

import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import AnnotationLayer from '../Layers/AnnotationLayer';
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
   * @param {TaskFrameLocationGateway} taskFrameLocationGateway
   * @param {FrameGateway} frameGateway
   * @param {DrawingContextService} drawingContextService
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   */
  constructor($scope, $element, taskFrameLocationGateway, frameGateway, drawingContextService, labeledThingInFrameGateway) {
    this._$scope = $scope;
    this._taskFrameLocationGateway = taskFrameLocationGateway;
    this._frameGateway = frameGateway;
    this._layerManager = new LayerManager();
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    $element[0].__endToEndTestOnlyLayerManager__ = this._layerManager;

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
    const totalFrameCount = this.task.frameRange.endFrameNumber - this.task.frameRange.startFrameNumber + 1;

    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, 'source', 0, totalFrameCount)
      .then(frameLocations => {
        this._frameLocations = frameLocations;
      });
  }

  /**
   * @private
   */
  _setBackground() {
    this._frameGateway.getImage(this._frameLocations[this.frameNumber - 1])
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
    return this._labeledThingInFrameGateway.listLabeledThingInFrame(this.task, frameNumber);
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

    this._labeledThingInFrameGateway.createLabeledThingInFrame(this.task, this.frameNumber, annotation)
      .then((labeledThingInFrame) => {
        const annotationLayer = this._layerManager.getLayer('annotations');
        annotationLayer.setAnnotation(annotationId, labeledThingInFrame);
      });

    this.onNewAnnotation({annotation, id: annotationId});
  }

  /**
   * @param {String} annotationId - Internal management id
   * @param {LabeledThingInFrame} annotation
   * @private
   */
  _onUpdatedAnnotation(annotationId, annotation) {
    this._labeledThingInFrameGateway.updateLabeledThingInFrame(annotation)
      .then((labeledThingInFrame) => {
        const annotationLayer = this._layerManager.getLayer('annotations');
        annotationLayer.setAnnotation(annotationId, labeledThingInFrame);
      });

    this.onUpdatedAnnotation({annotation, id: annotationId});
  }
}

ViewerStageController.$inject = [
  '$scope',
  '$element',
  'taskFrameLocationGateway',
  'frameGateway',
  'drawingContextService',
  'labeledThingInFrameGateway',
];

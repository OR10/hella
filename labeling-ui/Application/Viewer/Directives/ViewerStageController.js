import LayerManager from '../Layers/LayerManager';
import EventDelegationLayer from '../Layers/EventDelegationLayer';
import ThingLayer from '../Layers/ThingLayer';
import BackgroundLayer from '../Layers/BackgroundLayer';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';

/**
 * @class ViewerStageController
 *
 * @property {Task} task
 * @property {FramePosition} framePosition
 * @property {Array.<LabeledThingInFrame>} labeledThingsInFrame
 * @property {Array.<LabeledThing> labeledThings
 * @property {LabeledThingInFrame} selectedLabeledThingInFrame
 * @property {string} activeTool
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
   * @param {EntityIdService} entityIdService
   */
  constructor($scope, $element, drawingContextService, taskFrameLocationGateway, frameGateway, labeledThingInFrameGateway, entityIdService) {
    /**
     * List of supported image types for this component
     *
     * @type {string[]}
     * @private
     */
    this._supportedImageTypes = ['source', 'sourceJpg'];

    /**
     * The currently selected Shape
     *
     * @type {Shape|null}
     */
    this.selectedShape = null;

    /**
     * The ghosted LabeledThingInFrame, if one exists for the current selection and frame
     *
     * @type {LabeledThingInFrame|null}
     */
    this.ghostedLabeledThingInFrame = null;

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
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

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

    /**
     * RingBuffer to ensure only the last requested Background image is loaded
     *
     * @type {AbortablePromiseRingBuffer}
     */
    this._backgroundBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * RingBuffer to ensure only the last requested ghost {@link LabeledThingInFrame} is loaded
     *
     * @type {AbortablePromiseRingBuffer}
     */
    this._ghostedLabeledThingInFrameBuffer = new AbortablePromiseRingBuffer(1);

    const eventDelegationLayer = new EventDelegationLayer();
    const thingLayer = new ThingLayer($scope.$new(), drawingContextService);
    const backgroundLayer = new BackgroundLayer($scope.$new(), drawingContextService);

    eventDelegationLayer.attachToDom($element.find('.event-delegation-layer')[0]);
    thingLayer.attachToDom($element.find('.annotation-layer')[0]);
    backgroundLayer.attachToDom($element.find('.background-layer')[0]);

    thingLayer.on('shape:new', shape => this._onNewShape(shape));
    thingLayer.on('shape:update', shape => this._onUpdatedShape(shape));

    this._layerManager.setEventDelegationLayer(eventDelegationLayer);
    this._layerManager.addLayer('annotations', thingLayer);
    this._layerManager.addLayer('background', backgroundLayer);


    $scope.$watch('vm.activeTool', newActiveTool => {
      thingLayer.activateTool(newActiveTool);
    });

    $scope.$watch('vm.selectedLabeledThingInFrame', () => {
      this.ghostedLabeledThingInFrame = null;
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
    // Update the possibly ghosted LabeledThingInFrame
    $scope.$watch('vm.framePosition.position', newPosition => {
      this._backgroundBuffer.add(
        this._loadFrameImage(newPosition)
      ).then(newFrameImage => {
        backgroundLayer.setBackgroundImage(newFrameImage);
        this.filters.filters.forEach(filter => {
          backgroundLayer.applyFilter(filter);
        });
        backgroundLayer.render();
      });

      if (this.selectedLabeledThingInFrame !== null) {
        this._ghostedLabeledThingInFrameBuffer.add(
          this._labeledThingInFrameGateway.getLabeledThingInFrame(
            this.task,
            newPosition,
            this.selectedLabeledThingInFrame.labeledThingId,
            0, 0 // @TODO: After backend fix to be removed
          )
        ).then(labeledThingsInFrame => {
          const ghostedLabeledThingsInFrame = labeledThingsInFrame.filter(item => item.ghost === true);
          if (ghostedLabeledThingsInFrame.length === 0) {
            // The labeledThingInFrame is not ghosted and will automatically be loaded during the basic labeledThingInFrame request
            return;
          }

          this.ghostedLabeledThingInFrame = ghostedLabeledThingsInFrame[0];
        });
      }
    });

    // Update selectedLabeledThingInFrame once a shape is selected
    $scope.$watch('vm.selectedShape', (newSelectedShape) => {
      if (newSelectedShape === null) {
        this.selectedLabeledThingInFrame = null;
      } else {
        const {shape} = newSelectedShape;
        this.selectedLabeledThingInFrame = this.labeledThingsInFrame[shape.labeledThingInFrameId];
      }
    });
  }

  /**
   * Load all {@link FrameLocation}s corresponding to the assigned Task
   *
   * @returns {AbortablePromise<Array<FrameLocation>>}
   * @private
   */
  _loadFrameLocations() {
    const imageTypes = this.task.requiredImageTypes.filter((imageType) => {
      return (this._supportedImageTypes.indexOf(imageType) !== -1);
    });
    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }
    const totalFrameCount = this.framePosition.endFrameNumber - this.framePosition.startFrameNumber + 1;
    return this._taskFrameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], 0, totalFrameCount);
  }

  /**
   * Fetch the frame image corresponding to the given frame number
   *
   * The frame number is 1-indexed
   *
   * @param frameNumber
   * @returns {AbortablePromise<HTMLImageElement>}
   * @private
   */
  _loadFrameImage(frameNumber) {
    return this._frameLocations.then(
      frameLocations => this._frameGateway.getImage(frameLocations[frameNumber - 1])
    );
  }

  _onUpdatedShape(shape) {
    let labeledThingInFrame = this.labeledThingsInFrame[shape.labeledThingInFrameId];

    if (labeledThingInFrame === undefined) {
      // A ghost shape has been updated
      // Let's bust the ghost and add it to the normal selection of labeledthingsinframe
      labeledThingInFrame = this.ghostedLabeledThingInFrame.ghostBust(
        this._entityIdService.getUniqueId(),
        this.framePosition.position
      );

      shape.labeledThingInFrameId = labeledThingInFrame.id;

      this.labeledThingsInFrame[labeledThingInFrame.id] = labeledThingInFrame;
      this.ghostedLabeledThingInFrame = null;
      this.selectedLabeledThingInFrame = labeledThingInFrame;
    }


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
  'entityIdService',
];

export default ViewerStageController;

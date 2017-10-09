import paper from 'paper';
import AbortablePromiseRingBuffer from 'Application/Common/Support/AbortablePromiseRingBuffer';
import ZoomViewerMoveTool from '../../Viewer/Tools/ZoomViewerMoveTool';

/**
 * Controller of the {@link PopupPanelDirective}
 */
class PopupPanelController {
  /**
   *
   * @param {$rootScope.Scope} $scope
   * @param {$q} $q
   * @param {angular.$window} $window
   * @param {angular.$element} $element
   * @param {AnimationFrameService} animationFrameService
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {FrameLocationGateway} frameLocationGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {$timeout} $timeout
   * @param {LabelStructureService} labelStructureService
   * @param {ShapeSelectionService} shapeSelectionService
   * @param {ShapeInboxService} shapeInboxService
   * @param {ShapeMergeService} shapeMergeService
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   */
  constructor(
    $scope,
    $q,
    $window,
    $element,
    animationFrameService,
    drawingContextService,
    frameGateway,
    frameLocationGateway,
    abortablePromiseFactory,
    $timeout,
    labelStructureService,
    shapeSelectionService,
    shapeInboxService,
    shapeMergeService,
    labeledThingInFrameGateway
  ) {
    this._minimapContainer = $element.find('.minimap-container');
    this._minimap = $element.find('.minimap');
    this._supportedImageTypes = ['sourceJpg', 'source'];

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {FrameLocationGateway}
     * @private
     */
    this._frameLocationGateway = frameLocationGateway;

    /**
     * @type {AbortablePromiseRingBuffer}
     */
    this._frameLocationsBuffer = new AbortablePromiseRingBuffer(1);

    /**
     * @type {FrameGateway}
     * @private
     */
    this._frameGateway = frameGateway;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;

    /**
     * @type {ShapeSelectionService}
     * @private
     */
    this._shapeSelectionService = shapeSelectionService;

    /**
     * @type {ShapeInboxService}
     * @private
     */
    this._shapeInboxService = shapeInboxService;

    /**
     * @type {ShapeMergeService}
     * @private
     */
    this._shapeMergeService = shapeMergeService;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    this._activeBackgroundImage = null;

    /**
     * @type {DrawingContext}
     * @private
     */
    this._context = drawingContextService.createContext();
    this._context.setup(this._minimap.get(0));

    this._context.withScope(scope => {
      /**
       * @type {paper.Layer}
       * @private
       */
      this._backgroundLayer = new scope.Layer();

      /**
       * @type {paper.Layer}
       * @private
       */
      this._thingLayer = new scope.Layer();
    });

    this._zoomViewerMoveTool = new ZoomViewerMoveTool(this._context);
    this._zoomViewerMoveTool.on('shape:update', shape => {
      $scope.$apply(() => {
        const scaleFactor = this._context.withScope(scope => {
          return scope.view.viewSize.width / this.video.metaData.width;
        });
        this.viewerViewport.panTo(shape.position.divide(scaleFactor));
      });
    });


    this._resizeDebounced = animationFrameService.debounce(() => this._resize());
    this._drawLayerDebounced = animationFrameService.debounce(() => {
      this._drawBackgroundImage();

      if (this.viewerViewport) {
        this._drawViewportBounds();
      }
    });

    // TODO needs to be called on side element resize as well
    $window.addEventListener('resize', this._resizeDebounced);

    $scope.$on('$destroy', () => {
      $window.removeEventListener('resize', this._resizeDebounced);
    });

    $scope.$watchGroup(['vm.popupPanelState', 'vm.popupPanelOpen'], ([newState, open]) => {
      if (open && newState === 'zoom') {
        // @TODO We need to force the rendering into another cycle since otherwise the container layout won't be done
        // resulting in a zero-sized canvas. There must be a better way to solve this problem at it's root though.
        this._$timeout(() => {
          this._resizeDebounced();
        }, 0);
      } else if (open && newState === 'inbox') {
        this._loadSelectedObjects();
      }
    });

    $scope.$watch('vm.framePosition.position', () => this._loadBackgroundImage());

    $scope.$watch('vm.viewerViewport.bounds', (newBounds, oldBounds) => {
      const newRounded = {};
      const oldRounded = {};

      if (newBounds) {
        newRounded.center = {x: Math.round(newBounds.center.x), y: Math.round(newBounds.center.y)};
        newRounded.width = Math.round(newBounds.width);
        newRounded.height = Math.round(newBounds.height);
      }

      if (oldBounds) {
        oldRounded.center = {x: Math.round(oldBounds.center.x), y: Math.round(oldBounds.center.y)};
        oldRounded.width = Math.round(oldBounds.width);
        oldRounded.height = Math.round(oldBounds.height);
      }

      if (newBounds) {
        if (oldBounds) {
          if (oldRounded.center.x !== newRounded.center.x ||
            oldRounded.center.y !== newRounded.center.y ||
            oldRounded.width !== newRounded.width ||
            oldRounded.height !== newRounded.height
          ) {
            this._drawViewportBounds();
          }
        } else {
          this._drawViewportBounds();
        }
      }
    });

    $scope.$on('sidebar.resized', () => this._resizeDebounced());

    this._resizeDebounced();

    /**
     * @type {Object.<{shape: PaperShape, label: String, labelStructureObject: LabelStructureObject}>}
     * @private
     */
    this._selectedObjects = {};

    /**
     * @type {number}
     * @private
     */
    this._selectedObjectsCounter = 1;

    this._selectedObjectsLabelCounter = {};

    this._shapeSelectionService.afterAnySelectionChange('PopupPanelController', () => {
      this._loadSelectedObjects();
    });

    this.hasMergableObjects = false;
  }

  /**
   * @return {Array}
   */
  get selectedObjects() {
    return Object.values(this._selectedObjects);
  }

  /**
   * @return {Array}
   */
  get savedObjects() {
    return this._shapeInboxService.getAllShapes();
  }

  /**
   * @return {boolean}
   */
  hasSelectedObjects() {
    return this.selectedObjects.length > 0;
  }

  /**
   * @return {boolean}
   */
  hasSavedObjects() {
    return this.savedObjects.length > 0;
  }

  /**
   * Check if shapes in inbox can be merged. Conditions are:
   *  - All shapes are on different frames
   *  - The root shape does not have LTIFs on any frame of the other objects
   *  - All shapes are of the same type
   *
   * @private
   */
  _calculateMergableObjects() {
    if (this.savedObjects.length > 1) {
      const rootShape = this.savedObjects[0].shape;
      const rootShapeConstructor = rootShape.constructor;

      let mergable = true;

      this.savedObjects.forEach(object => {
        // Do nothing if the current object is the rootObject or if the shapes are already unmergable
        if (object.shape === rootShape || !mergable) {
          return;
        }
        const isOfSameType = (rootShapeConstructor === object.shape.constructor);

        mergable &= isOfSameType;
      });

      this.hasMergableObjects = mergable;
    } else {
      this.hasMergableObjects = false;
    }
  }

  mergeShapes() {
    const rootShape = this.savedObjects[0].shape;
    const rootShapeConstructor = rootShape.constructor;

    const shapes = this.savedObjects.map(object => object.shape);
    const mergableShapes = shapes.filter(shape => {
      if (shape === rootShape) {
        return true;
      }
      const isOfSameType = (rootShapeConstructor === shape.constructor);

      return isOfSameType;
    });

    this._shapeMergeService.mergeShapes(mergableShapes).then(() => this.removeAllFromInbox());
  }

  /**
   * Adds a shape to the inbox
   *
   * @param {Object.<{shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}>} shapeInformation
   */
  addToInbox(shapeInformation) {
    this._shapeInboxService.addShape(shapeInformation);
    this._loadSelectedObjects();
  }

  /**
   * Adds all selected shapes to the inbox
   */
  addAllToInbox() {
    this._shapeInboxService.addShapes(this.selectedObjects);
    this._loadSelectedObjects();
  }

  /**
   * Clears the inbox
   */
  removeAllFromInbox() {
    this._shapeInboxService.clear();
    this._loadSelectedObjects();
  }

  /**
   * Removes a shape from the inbox
   *
   * @param {Object.<{shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}>} shapeInformation
   */
  removeFromInbox(shapeInformation) {
    this._shapeInboxService.removeShape(shapeInformation);
    this._loadSelectedObjects();
  }

  /**
   * Load the selected objects. Looks up the name in the Task Definition and adds the information
   * as well as a label with a unique number to the shapeInformation
   *
   * @private
   */
  _loadSelectedObjects() {
    this._selectedObjects = {};

    this._shapeSelectionService.getAllShapes().forEach(shape => {
      if (shape.labeledThingInFrame === undefined) {
        return;
      }

      if (shape.labeledThingInFrame.ghost) {
        return;
      }

      this._labelStructureService.getLabelStructure(shape.labeledThingInFrame.task)
        .then(structure => {
          return structure.getThingById(shape.labeledThingInFrame.identifierName);
        })
        .then(labelStructureObject => {
          if (this._selectedObjects[shape.id] === undefined) {
            if (this._selectedObjectsLabelCounter[shape.id] === undefined) {
              this._selectedObjectsLabelCounter[shape.id] = this._selectedObjectsCounter++;
            }

            const label = `${labelStructureObject.name} #${this._selectedObjectsLabelCounter[shape.id]}`;
            const shapeInformation = {shape, label, labelStructureObject};

            if (!this._shapeInboxService.hasShape(shapeInformation)) {
              this._selectedObjects[shape.id] = shapeInformation;
            }
          }
        })
        .then(() => this._calculateMergableObjects());
    });
  }

  _loadBackgroundImage() {
    const imageTypes = this.task.requiredImageTypes.filter(
      imageType => {
        return (this._supportedImageTypes.indexOf(imageType) !== -1);
      }
    );

    if (!imageTypes.length) {
      throw new Error('No supported image type found');
    }

    this._frameLocationsBuffer.add(
      this._frameLocationGateway.getFrameLocations(this.task.id, imageTypes[0], this.framePosition.position)
        .then(([frameLocation]) => {
          return this._frameGateway.getImage(frameLocation);
        })
        .then(image => {
          this._activeBackgroundImage = image;
          this._drawLayerDebounced();
        })
    );
  }

  _resize() {
    const width = this._minimapContainer.width();
    const height = this._minimapContainer.height();

    // Original video width and height
    const {width: videoWidth, height: videoHeight} = this.video.metaData;

    const fittedWidth = Math.round(videoWidth / videoHeight * height);
    const fittedHeight = Math.round(videoHeight / videoWidth * width);

    const canvasWidth = fittedWidth <= width ? fittedWidth : width;
    const canvasHeight = fittedWidth <= width ? height : fittedHeight;

    this._context.withScope(scope => {
      scope.view.viewSize = new scope.Size(
        canvasWidth, canvasHeight
      );
      this._minimap.css({width: `${canvasWidth}px`, height: `${canvasHeight}px`});

      scope.view.update();
    });

    this._drawLayerDebounced();
  }

  _drawBackgroundImage() {
    const image = this._activeBackgroundImage;

    this._context.withScope(() => {
      this._backgroundLayer.activate();
      this._backgroundLayer.removeChildren();
    });

    if (image === null) {
      return;
    }

    this._context.withScope(scope => {
      const zoom = scope.view.size.width / image.width;
      const imageCenter = new scope.Point(image.width / 2, image.height / 2);

      const rasterImage = new scope.Raster(image, imageCenter);

      this._applyFilters(rasterImage, this.filters);

      this._backgroundLayer.scale(zoom, new scope.Point(0, 0));

      scope.view.update();
    });
  }

  _drawViewportBounds() {
    this._context.withScope(
      scope => {
        this._thingLayer.activate();
        this._thingLayer.removeChildren();

        const viewportScaleX = scope.view.viewSize.width / this.video.metaData.width;
        const {topLeft, bottomRight} = this.viewerViewport.bounds;

        this._viewportBoundsRect = new scope.Path.Rectangle(
          {
            topLeft,
            bottomRight,
            strokeColor: '#bedb31',
            fillColor: new paper.Color(0, 0, 0, 0),
          }
        );

        this._thingLayer.scale(viewportScaleX, new scope.Point(0, 0));

        scope.view.update();
      }
    );
  }

  /**
   * Apply all given filters to a given RasterImage
   *
   * @param {paper.Raster} rasterImage
   * @param {Filters} filters
   * @private
   */
  _applyFilters(rasterImage, filters) {
    this._context.withScope(scope => {
      const originalImageData = rasterImage.getImageData(
        new scope.Rectangle(0, 0, rasterImage.width, rasterImage.height)
      );
      const filteredImageData = filters.filters.reduce(
        (imageData, filter) => filter.manipulate(imageData),
        originalImageData
      );
      rasterImage.setImageData(filteredImageData, new scope.Point(0, 0));
    });
  }

  zoomInToggle() {
    if (this.activeTool === 'zoomIn') {
      this.activeTool = 'multi';
    } else {
      this.activeTool = 'zoomIn';
    }
  }

  zoomOutToggle() {
    if (this.activeTool === 'zoomOut') {
      this.activeTool = 'multi';
    } else {
      this.activeTool = 'zoomOut';
    }
  }

  scaleToFit() {
    // Disable Zoom-Mode if it has been enabled
    this.activeTool = 'multi';
    this.viewerViewport.scaleToFit();
  }
}

PopupPanelController.$inject = [
  '$scope',
  '$q',
  '$window',
  '$element',
  'animationFrameService',
  'drawingContextService',
  'frameGateway',
  'frameLocationGateway',
  'abortablePromiseFactory',
  '$timeout',
  'labelStructureService',
  'shapeSelectionService',
  'shapeInboxService',
  'shapeMergeService',
  'labeledThingInFrameGateway',
];

export default PopupPanelController;

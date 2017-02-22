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
   * @param {angular.$window} $window
   * @param {angular.$element} $element
   * @param {AnimationFrameService} animationFrameService
   * @param {DrawingContextService} drawingContextService
   * @param {FrameGateway} frameGateway
   * @param {FrameLocationGateway} frameLocationGateway
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {$timeout} $timeout
   */
  constructor($scope, $window, $element, animationFrameService, drawingContextService, frameGateway, frameLocationGateway, abortablePromiseFactory, $timeout) {
    this._minimapContainer = $element.find('.minimap-container');
    this._minimap = $element.find('.minimap');
    this._supportedImageTypes = ['sourceJpg', 'source'];

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

    this._$timeout = $timeout;

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
  '$window',
  '$element',
  'animationFrameService',
  'drawingContextService',
  'frameGateway',
  'frameLocationGateway',
  'abortablePromiseFactory',
  '$timeout',
];

export default PopupPanelController;

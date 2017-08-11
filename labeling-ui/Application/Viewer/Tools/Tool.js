import paper from 'paper';
import EventEmitter from 'event-emitter';

/**
 * Base class for Tools using the PaperJs tool concept
 */
export default class Tool extends EventEmitter {
  /**
   * @param {DrawingContext} drawingContext
   * @param {LoggerService} loggerService
   * @param {Object} [options]
   */
  constructor(drawingContext, loggerService, options) {
    super();

    /**
     * @type {DrawingContext}
     * @protected
     */
    this._context = drawingContext;

    /**
     * @type {LoggerService}
     */
    this.logger = loggerService;

    /**
     * Tool options
     *
     * @type {Object}
     * @protected
     */
    this._options = null;

    this._initializeOptions(options);

    this._context.withScope(() => {
      this._tool = new paper.Tool();
      this._tool.minDistance = this._options.minDistance;
    });
  }

  /**
   * @param {Object} options
   * @private
   */
  _initializeOptions(options) {
    const defaultOptions = {
      minDistance: 1,
      hitTestTolerance: 8,
    };
    this._options = Object.assign({}, defaultOptions, options);
  }

  /**
   * Activate this tool
   */
  activate() {
    console.log('foobar');
    this._context.withScope(() => {
      this._tool.activate();
    });
  }

  /**
   * Restrict the position of the paper shape to within the bounds of the view
   *
   * The provided as well as returned point is supposed to be the center point of the shape.
   *
   * @param {PaperShape} shape
   * @param {paper.Point} point
   * @returns {paper.Point}
   * @private
   */
  _restrictToViewport(shape, point) {
    const viewWidth = this._$scope.vm.viewport.bounds.width * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const viewHeight = this._$scope.vm.viewport.bounds.height * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const shapeWidth = shape.bounds.width;
    const shapeHeight = shape.bounds.height;

    let minimalVisibleShapeOverflowX = this._$scope.vm.task.minimalVisibleShapeOverflow;
    let minimalVisibleShapeOverflowY = this._$scope.vm.task.minimalVisibleShapeOverflow;

    if (minimalVisibleShapeOverflowX === null) {
      minimalVisibleShapeOverflowX = shapeWidth;
    }

    if (minimalVisibleShapeOverflowY === null) {
      minimalVisibleShapeOverflowY = shapeHeight;
    }

    const minX = (shapeWidth / 2) - (shapeWidth - minimalVisibleShapeOverflowX);
    const maxX = viewWidth - (shapeWidth / 2) + (shapeWidth - minimalVisibleShapeOverflowX);
    const minY = (shapeHeight / 2) - (shapeHeight - minimalVisibleShapeOverflowY);
    const maxY = viewHeight - (shapeHeight / 2) + (shapeHeight - minimalVisibleShapeOverflowY);

    return new paper.Point(
      this._clampTo(minX, maxX, point.x),
      this._clampTo(minY, maxY, point.y)
    );
  }

  /**
   * Clamp a value to a given range
   *
   * @param {number} minClamp
   * @param {number} maxClamp
   * @param {number} value
   * @private
   */
  _clampTo(minClamp, maxClamp, value) {
    return Math.max(minClamp, Math.min(maxClamp, value));
  }

  onMouseUp() {
  }

  onMouseDown() {
  }

  onMouseDrag() {
  }

  onMouseMove() {
  }

  onKeyPress() {
  }

}

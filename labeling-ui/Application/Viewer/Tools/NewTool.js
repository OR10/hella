import paper from 'paper';
import ToolAbortedError from './Errors/ToolAbortedError';

/**
 * Base class for Tools using the PaperJs tool concept
 */
class Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    /**
     * @type {DrawingContext}
     * @protected
     */
    this._context = drawingContext;

    /**
     * @type {$scope}
     * @protected
     */
    this._$rootScope = $rootScope;

    /**
     * @type {$q}
     * @protected
     */
    this._$q = $q;

    /**
     * @type {LoggerService}
     * @protected
     */
    this._logger = loggerService;

    /**
     * @type {Promise|null}
     * @private
     */
    this._deferred = null;

    /**
     * @type {ToolActionStruct|null}
     * @protected
     */
    this._toolActionStruct = null;

    /**
     * @type {paper.Tool|null}
     * @private
     */
    this._tool = null;

    /**
     * Information about whether the fired drag event is the first one received
     *
     * Paperjs fires a drag event without adhering to minDistance as soon as the first mouseDown is registered.
     * We do not want this, as a drag should only occur once the mouse is really dragged the minDistance.
     *
     * @type {boolean}
     * @private
     */
    this._firstDragEvent = true;

    this._initializePaperToolAndEvents();
  }

  _delegateMouseEvent(type, event) {
    const delegationTarget = `onMouse${type.substr(0, 1).toUpperCase()}${type.substr(1).toLowerCase()}`;

    switch (type) {
      case 'up':
        this[delegationTarget](event);
        this.onMouseClick(event);
        break;
      case 'move':
        this._$rootScope.$evalAsync(() => this[delegationTarget](event));
        break;
      case 'drag':
        if (this._firstDragEvent === true) {
          this._firstDragEvent = false;
          return;
        }
        this[delegationTarget](event);
        break;
      default:
        this[delegationTarget](event);
    }
    // this._context.withScope(scope => scope.view.update());
  }

  /**
   * @private
   */
  _initializePaperToolAndEvents() {
    this._context.withScope(() => {
      this._tool = new paper.Tool();
    });

    this._tool.onMouseDown = event => this._delegateMouseEvent('down', event);
    this._tool.onMouseUp = event => this._delegateMouseEvent('up', event);
    this._tool.onMouseDrag = event => this._delegateMouseEvent('drag', event);
    this._tool.onMouseMove = event => this._delegateMouseEvent('move', event);
  }

  /**
   * Handler for a mouse up event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onMouseUp(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Handler for a mouse down event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onMouseDown(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Handler for a mouse move event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onMouseMove(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Handler for a mouse drag event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onMouseDrag(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Handler for a mouse click event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onMouseClick(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {ToolActionStruct} toolActionStruct
   * @returns {Promise}
   * @protected
   */
  _invoke(toolActionStruct) {
    this._logger.log('tool', 'Invoked', toolActionStruct);

    this._firstDragEvent = true;
    this._tool.minDistance = toolActionStruct.options.minDistance;

    this._context.withScope(() => {
      this._tool.activate();
    });

    this._toolActionStruct = toolActionStruct;
    this._deferred = this._$q.defer();

    return this._deferred.promise;
  }

  /**
   * Cancel all current tool actions and clean up the state.
   */
  abort() {
    this._reject(new ToolAbortedError('Tool was aborted!'));
    this._logger.log('tool', 'Aborted');
  }

  /**
   * Cancel all current tool actions and clean up the state.
   *
   * @param {*} reason
   * @protected
   */
  _reject(reason) {
    this._disableInternalPaperTool();
    if (this._deferred !== null) {
      this._deferred.reject(reason);
      this._deferred = null;
    }
  }

  /**
   * Internal function that is called after the tool workflow has finished
   *
   * @param {*} result
   * @protected
   */
  _complete(result) {
    this._disableInternalPaperTool();
    this._deferred.resolve(result);
    this._deferred = null;
    this._logger.log('tool', 'Resolved', result);
  }

  _disableInternalPaperTool() {
    this._context.withScope(scope => {
      scope.tool = null;
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
   * @protected
   */
  _restrictToViewport(shape, point, minimalVisibleShapeOverflowX = shape.bounds.width, minimalVisibleShapeOverflowY = shape.bounds.height) {
    const {viewport} = this._toolActionStruct;
    const viewWidth = viewport.bounds.width * viewport.zoom / viewport.getScaleToFitZoom();
    const viewHeight = viewport.bounds.height * viewport.zoom / viewport.getScaleToFitZoom();
    const shapeWidth = shape.bounds.width;
    const shapeHeight = shape.bounds.height;

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
}

Tool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default Tool;


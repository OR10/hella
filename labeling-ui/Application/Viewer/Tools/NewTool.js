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
     * @type {int}
     * @private
     */
    this._dragEventCount = 0;

    this._initializePaperToolAndEvents();
  }

  /**
   * @param {string} type
   * @param {paper.Event} event
   * @private
   */
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
        this._dragEventCount = this._dragEventCount + 1;
        if (this._dragEventCount === 1) {
          // Do not propagate first drag event, as it is fired directly after the first mouse down not adhering to min distance
          return;
        }
        if (this._dragEventCount === 2) {
          // The first delegated drag event has been fired, therefore the minDistance needs to be reduced to the real value
          // instead of the initial one.
          this._tool.minDistance = this._toolActionStruct.options.minDragDistance;
        }
        this[delegationTarget](event);
        break;
      default:
        this[delegationTarget](event);
    }
    // this._context.withScope(scope => scope.view.update());
  }

  /**
   * @param {string} type
   * @param {paper.Event} event
   * @private
   */
  _delegateKeyboardEvent(type, event) {
    const delegationTarget = `onKey${type.substr(0, 1).toUpperCase()}${type.substr(1).toLowerCase()}`;

    switch (type) {
      default:
        this[delegationTarget](event);
    }
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

    this._tool.onKeyDown = event => this._delegateKeyboardEvent('down', event);
    this._tool.onKeyUp = event => this._delegateKeyboardEvent('up', event);
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
   * Handler for a keyboard up event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onKeyUp(event) { // eslint-disable-line no-unused-vars

  }

  /**
   * Handler for a keyboard down event.
   * Expects a {@link paper.Event} as only parameter.
   *
   * @param {paper.Event} event
   */
  onKeyDown(event) { // eslint-disable-line no-unused-vars

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
    const staticSelf = this.constructor;
    this._logger.groupStartOpened('tool:invocation', `Invocation ${staticSelf.getToolName()}`, toolActionStruct);

    this._dragEventCount = 0;

    // Set initialDragDistance for first Drag event
    this._tool.minDistance = toolActionStruct.options.initialDragDistance;

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
  }

  /**
   * Cancel all current tool actions and clean up the state.
   *
   * @param {*} reason
   * @protected
   */
  _reject(reason) {
    const staticSelf = this.constructor;
    this._logger.log('tool:invocation', `Rejected ${staticSelf.getToolName()}`, reason);
    this._logger.groupEnd('tool:invocation');

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
   * @return {Promise}
   * @protected
   */
  _complete(result) {
    const staticSelf = this.constructor;
    this._logger.log('tool:invocation', `Resolved ${staticSelf.getToolName()}`, result);
    this._logger.groupEnd('tool:invocation');

    this._disableInternalPaperTool();
    this._deferred.resolve(result);
    const promise = this._deferred.promise;
    this._deferred = null;

    return promise;
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

/**
 * Return the name of the tool. The name needs to be unique within the application.
 * Therefore something like a prefix followed by the className is advisable.
 *
 * @return {string}
 * @public
 * @abstract
 * @static
 */
Tool.getToolName = function () {
  throw new Error('Abstract method getToolName: Every tool needs to implement this method.');
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
Tool.isShapeClassSupported = function (shapeClass) {
  throw new Error('Abstract method isShapeClassSupported: Every tool needs to implement this method.');
};

/**
 * Check if the given actionIdentifer is supported by this tool.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
Tool.isActionIdentifierSupported = function (actionIdentifier) {
  throw new Error('Abstract method isActionIdentifierSupported: Every tool needs to implement this method.');
};

Tool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default Tool;


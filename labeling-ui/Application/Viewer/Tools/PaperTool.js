import paper from 'paper';
import Tool from './NewTool';

/**
 * Base class for Tools using the PaperJs tool concept
 */
class PaperTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    super(drawingContext, $rootScope, $q, loggerService);

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
    const promise = super._invoke(toolActionStruct);

    this._dragEventCount = 0;

    // Set initialDragDistance for first Drag event
    this._tool.minDistance = toolActionStruct.options.initialDragDistance;

    this._context.withScope(() => {
      this._tool.activate();
    });

    return promise;
  }

  /**
   * Cancel all current tool actions and clean up the state.
   *
   * @param {*} reason
   * @protected
   */
  _reject(reason) {
    this._disableInternalPaperTool();
    super._reject(reason);
  }

  /**
   * Internal function that is called after the tool workflow has finished
   *
   * @param {*} result
   * @return {Promise}
   * @protected
   */
  _complete(result) {
    this._disableInternalPaperTool();
    return super._complete(result);
  }

  _disableInternalPaperTool() {
    this._context.withScope(scope => {
      scope.tool = null;
    });
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
PaperTool.getToolName = function () {
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
PaperTool.isShapeClassSupported = function (shapeClass) {
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
PaperTool.isActionIdentifierSupported = function (actionIdentifier) {
  throw new Error('Abstract method isActionIdentifierSupported: Every tool needs to implement this method.');
};

PaperTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PaperTool;


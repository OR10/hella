import paper from 'paper';
import {clone} from 'lodash';
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
     * Paperjs fires a drag event without adhering to minDistance in certain situations. Therefore we track the distance ourselves
     * and act accordingly
     *
     * @type {string}
     * @private
     */
    this._dragEventState = 'initial';

    /**
     * @type {paper.Point|null}
     * @private
     */
    this._lastDragPoint = null;

    this._initializePaperToolAndEvents();
  }

  /**
   * @param {string} type
   * @param {paper.Event} event
   */
  delegateMouseEvent(type, event) {
    const eventTypeFirstLetter = type.substr(0, 1).toUpperCase();
    const eventTypeRemainingLetters = type.substr(1).toLowerCase();
    const delegationTarget = `onMouse${eventTypeFirstLetter}${eventTypeRemainingLetters}`;

    const roundedEventPoint = new paper.Point(
      Math.round(event.point.x),
      Math.round(event.point.y)
    );
    event.point = roundedEventPoint;

    switch (type) {
      case 'down':
        this._dragEventState = 'initial';
        this._lastDragPoint = event.point;
        this[delegationTarget](event);
        break;
      case 'up':
        this._mouseDownPoint = null;
        this._dragEventState = 'initial';
        this[delegationTarget](event);
        this.onMouseClick(event);
        break;
      case 'move':
        this._$rootScope.$evalAsync(() => this[delegationTarget](event));
        break;
      case 'drag':
        const eventPoint = event.point;

        if (this._lastDragPoint === null) {
          return;
        }

        if (this._dragEventState === 'initial') {
          if (this._lastDragPoint.getDistance(eventPoint) < this._toolActionStruct.options.initialDragDistance) {
            return;
          }
          this._dragEventState = 'inProgress';
        } else if (this._dragEventState === 'inProgress') {
          if (this._lastDragPoint.getDistance(eventPoint) < this._toolActionStruct.options.minDragDistance) {
            return;
          }
        }
        this._lastDragPoint = eventPoint;
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
  delegateKeyboardEvent(type, event) {
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

    this._tool.onMouseDown = event => this.delegateMouseEvent('down', event);
    this._tool.onMouseUp = event => this.delegateMouseEvent('up', event);
    this._tool.onMouseDrag = event => this.delegateMouseEvent('drag', event);
    this._tool.onMouseMove = event => this.delegateMouseEvent('move', event);

    this._tool.onKeyDown = event => this.delegateKeyboardEvent('down', event);
    this._tool.onKeyUp = event => this.delegateKeyboardEvent('up', event);
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

    this._dragEventState = 'initial';
    this._lastDragPoint = null;

    // We handle drag distance calculation ourselves
    this._tool.minDistance = 1;

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
    if (this._invoked === true) {
      this._disableInternalPaperTool();
      super._reject(reason);
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
    if (this._invoked === true) {
      this._disableInternalPaperTool();
      return super._complete(result);
    }
  }

  _disableInternalPaperTool() {
    this._context.withScope(scope => {
      scope.tool = null;
    });
  }

  /**
   * Generates an extended keyboard modifier object with the specified keys
   * added in short syntax ($keyName instead of $keyName+Key)
   *
   * Currently the following keys are processed:
   * - alt
   *
   * @param {Event} event
   * @protected
   */
  _getKeyboardModifiers(event) {
    const modifiers = clone(event.modifiers);
    const keys = ['altKey'];

    keys.forEach(key => {
      const shortName = key.replace(/Key/, '');
      modifiers[shortName] = event.event[key];
    });

    return modifiers;
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
PaperTool.getToolName = () => {
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
PaperTool.isShapeClassSupported = shapeClass => { // eslint-disable-line no-unused-vars
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
PaperTool.isActionIdentifierSupported = actionIdentifier => { // eslint-disable-line no-unused-vars
  throw new Error('Abstract method isActionIdentifierSupported: Every tool needs to implement this method.');
};

PaperTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PaperTool;


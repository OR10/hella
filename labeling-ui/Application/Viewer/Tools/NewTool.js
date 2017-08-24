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
   * @param {ModalService} modalService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, modalService) {
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
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

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
     * @type {boolean}
     * @private
     */
    this._invoked = false;
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
    this._notifyScope('invoked', toolActionStruct);

    if (this._invoked === true) {
      throw new Error('Tool already invoked!');
    }
    const staticSelf = this.constructor;
    this._logger.groupStartOpened('tool:invocation', `Invocation ${staticSelf.getToolName()}`, toolActionStruct);

    this._toolActionStruct = toolActionStruct;
    this._deferred = this._$q.defer();
    this._invoked = true;
    return this._deferred.promise;
  }

  /**
   * Emits an event on the rootScope named after the given action, passing the current tool and the given data.
   *
   * @protected
   */
  _notifyScope(action, data) {
    this._$rootScope.$emit(`tool:${action}`, this, data);
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
   * @param {boolean} displayModalInfo
   * @protected
   */
  _reject(reason, displayModalInfo = false) {
    this._notifyScope('abort', reason);
    if (this._deferred !== null && this._invoked === true) {
      const staticSelf = this.constructor;
      this._logger.log('tool:invocation', `Rejected ${staticSelf.getToolName()}`, reason);
      this._logger.groupEnd('tool:invocation');

      if (displayModalInfo) {
          console.log(this._modalService);
          this._modalService.info(
              {
                  title: 'Error',
                  headline: reason.message,
              },
              undefined,
              undefined,
              {
                  warning: true,
                  abortable: false,
              }
          );
      }

      this._invoked = false;
      this._deferred.reject(reason);
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
    this._notifyScope('abort', result);

    if (this._invoked === true) {
      const staticSelf = this.constructor;
      this._logger.log('tool:invocation', `Resolved ${staticSelf.getToolName()}`, result);
      this._logger.groupEnd('tool:invocation');

      this._invoked = false;
      this._deferred.resolve(result);
      const promise = this._deferred.promise;
      this._deferred = null;

      return promise;
    }
  }

  /**
   * Restrict the position of the paper shape to within the bounds of the view
   *
   * The provided as well as returned point is supposed to be the center point of the shape.
   *
   * @param {PaperShape} shape
   * @param {paper.Point} point
   * @param {number} minimalVisibleShapeOverflow
   * @returns {paper.Point}
   * @protected
   */
  _restrictToViewport(shape, point, minimalVisibleShapeOverflow = null) {
    let minimalVisibleShapeOverflowX = shape.bounds.width;
    let minimalVisibleShapeOverflowY = shape.bounds.height;

    if (minimalVisibleShapeOverflow !== null) {
      minimalVisibleShapeOverflowX = minimalVisibleShapeOverflow;
      minimalVisibleShapeOverflowY = minimalVisibleShapeOverflow;
    }

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
Tool.getToolName = () => {
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
Tool.isShapeClassSupported = shapeClass => { // eslint-disable-line no-unused-vars
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
Tool.isActionIdentifierSupported = actionIdentifier => { // eslint-disable-line no-unused-vars
  throw new Error('Abstract method isActionIdentifierSupported: Every tool needs to implement this method.');
};

Tool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'modalService',
];

export default Tool;


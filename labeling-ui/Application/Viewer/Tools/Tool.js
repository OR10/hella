import paper from 'paper';
import EventEmitter from 'event-emitter';

/**
 * Base class for Tools using the PaperJs tool concept
 *
 * @class Tool
 */
export default class Tool extends EventEmitter {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super();

    /**
     * @type {DrawingContext}
     * @private
     */
    this._context = drawingContext;

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
    this._context.withScope(() => {
      this._tool.activate();
    });
  }

}

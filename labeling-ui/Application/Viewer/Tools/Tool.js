import paper from 'paper';
import EventEmitter from 'event-emitter';

/**
 * @class Tool
 */
export default class Tool extends EventEmitter {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super();

    this._context = drawingContext;
    this._initializeOptions(options);

    this._context.withScope(() => {
      this._tool = new paper.Tool();
      this._tool.minDistance = this._options.minDistance;
    });
  }

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

import ToolActionStruct from './ToolActionStruct';

class ZoomToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {string} mouseCursor
   * @param {Function} zoomFunction
   */
  constructor(options, viewport, mouseCursor, zoomFunction) {
    super (options, viewport);

    /**
     * @type {string}
     */
    this.mouseCursor = mouseCursor;

    /**
     * @type {Function}
     */
    this.zoomFunction = zoomFunction;
  }
}

export default ZoomToolActionStruct;

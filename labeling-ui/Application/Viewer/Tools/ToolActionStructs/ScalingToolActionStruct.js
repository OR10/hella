import ToolActionStruct from './ToolActionStruct';

class ScalingToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {PaperShape} shape
   * @param {Handle} handle
   */
  constructor(options, viewport, shape, handle) {
    super(options, viewport);

    /**
     * @type {PaperShape}
     */
    this.shape = shape;

    /**
     * @type {Handle}
     */
    this.handle = handle;
  }
}

export default ScalingToolActionStruct;

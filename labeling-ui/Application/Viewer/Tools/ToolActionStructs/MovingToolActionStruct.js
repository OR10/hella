import ToolActionStruct from './ToolActionStruct';

class MovingToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {PaperShape} shape
   */
  constructor(options, viewport, shape) {
    super(options, viewport);

    /**
     * @type {PaperShape}
     */
    this.shape = shape;
  }
}

export default MovingToolActionStruct;

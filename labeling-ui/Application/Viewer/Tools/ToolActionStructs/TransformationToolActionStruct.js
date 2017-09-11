import ToolActionStruct from './ToolActionStruct';

class TransformationToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {PaperShape} shape
   * @param {Handle} handle
   * @param {paper.Point} point
   */
  constructor(options, viewport, shape, handle, point) {
    super(options, viewport);

    /**
     * @type {PaperShape}
     */
    this.shape = shape;

    /**
     * @type {Handle}
     */
    this.handle = handle;

    /**
     * @type {paper.Point}
     */
    this.point = point;
  }
}

export default TransformationToolActionStruct;

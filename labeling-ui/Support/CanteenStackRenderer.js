import Canvas from 'canvas';

/**
 * Render utillity to create a filled Canvas based on canteen stack output
 */
class CanteenStackRenderer {
  /**
   * @param {Integer} width
   * @param {Integer} height
   * @param {String} background
   */
  constructor(width, height, background) {
    /**
     * @type {Integer}
     * @private
     */
    this._width = width;

    /**
     *
     * @type {Integer}
     * @private
     */
    this._height = height;

    /**
     * @type {String}
     * @private
     */
    this._background = background;
  }

  /**
   * Render the given stack information into a canvas
   *
   * @param {Array.<Object>} stack
   * @return {Canvas}
   */
  render(stack) {
    const canvas = new Canvas(this._width, this._height);
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.fillStyle = this._background;
    ctx.clearRect(0, 0, this._width, this._height);
    ctx.restore();

    this._visitStack(ctx, stack);

    return canvas;
  }

  /**
   * Visit a canteen stack rendering it to the given context
   * @param {Context} ctx
   * @param {Array.<Object>} stack
   * @private
   */
  _visitStack(ctx, stack) {
    stack.forEach(operation => this._visitCanvasOperation(ctx, operation));
  }

  /**
   * Visit an arbitrary canvas operation from within the stack
   *
   * @param {Context} ctx
   * @param {Object} operation
   * @private
   */
  _visitCanvasOperation(ctx, operation) {
    switch (true) {
      case operation.method !== undefined:
        this._visitMethodCall(ctx, operation);
        break;
      case operation.attr !== undefined:
        this._visitAttributeSetter(ctx, operation);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Visit a method call to the context
   *
   * @param {Context} ctx
   * @param {Object} operation
   * @private
   */
  _visitMethodCall(ctx, operation) {
    ctx[operation.method].apply(ctx, operation.arguments);
  }

  /**
   * Visit a setter for an attribute
   *
   * @param {Context} ctx
   * @param {Object} operation
   * @private
   */
  _visitAttributeSetter(ctx, operation) {
    ctx[operation.attr] = operation.val;
  }
}

export default CanteenStackRenderer;

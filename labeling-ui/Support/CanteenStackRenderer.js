import Canvas from 'canvas';

/**
 * Render utillity to create a filled Canvas based on canteen stack output
 */
class CanteenStackRenderer {
  /**
   * @param {String} background
   */
  constructor(background) {
    /**
     * @type {String}
     * @private
     */
    this._background = background;
  }

  /**
   * Render the given stack information into a canvas
   *
   * @param {Array.<Object>} drawingStack
   * @return {Canvas}
   */
  render(drawingStack) {
    const canvas = new Canvas(drawingStack.width, drawingStack.height);
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.fillStyle = this._background;
    ctx.clearRect(0, 0, drawingStack.width, drawingStack.height);
    ctx.restore();

    this._visitOperations(ctx, drawingStack.operations);

    return canvas;
  }

  /**
   * Visit a canteen stack rendering it to the given context
   * @param {Context} ctx
   * @param {Array.<Object>} stack
   * @private
   */
  _visitOperations(ctx, stack) {
    stack.forEach(operation => this._visitOperation(ctx, operation));
  }

  /**
   * Visit an arbitrary canvas operation from within the stack
   *
   * @param {Context} ctx
   * @param {Object} operation
   * @private
   */
  _visitOperation(ctx, operation) {
    switch (true) {
      case operation.method !== undefined:
        this._visitMethodCallOperation(ctx, operation);
        break;
      case operation.attr !== undefined:
        this._visitAttributeSetterOperation(ctx, operation);
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
  _visitMethodCallOperation(ctx, operation) {
    ctx[operation.method].apply(ctx, operation.arguments);
  }

  /**
   * Visit a setter for an attribute
   *
   * @param {Context} ctx
   * @param {Object} operation
   * @private
   */
  _visitAttributeSetterOperation(ctx, operation) {
    ctx[operation.attr] = operation.val;
  }
}

export default CanteenStackRenderer;

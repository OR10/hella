import paper from 'paper';

/**
 * Abstraction class used to interact with PaperJs scopes.
 *
 * Classes using a DrawingContext can use its DrawingContext#withScope method to execute
 * code within the PaperJs scope associated with the context.
 */
class DrawingContext {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    /**
     * The scope associated with this context
     *
     * @type {paper.PaperScope}
     */
    this.scope = new paper.PaperScope();


    /**
     * Reference to the {@link DrawingContextService} this `DrawingContext` has been created at.
     *
     * @type {DrawingContextService}
     * @private
     */
    this._service = drawingContextService;
  }

  /**
   * Set up this context connecting it to a given canvas
   *
   * @param {HTMLCanvasElement} element
   */
  setup(element) {
    this.scope.setup(element);
  }

  /**
   * Execute operations with the `paper.Scope` of this `DrawingContext` active
   *
   * The provided function will be executed synchronously with the correct `paper.Scope` provided
   *
   * @param {Function} operation
   */
  withScope(operation) {
    this._service.withDrawingContext(this, operation);
  }
}

export default DrawingContext;

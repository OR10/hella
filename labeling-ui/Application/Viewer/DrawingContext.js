import paper from 'paper';

/**
 * Abstraction class used to interact with PaperJs scopes.
 *
 * Classes using a DrawingContext can use its DrawingContext#withScope method to execute
 * code within the PaperJs scope associated with the context.
 *
 * @class DrawingContext
 */
export default class DrawingContext {
  constructor(activeScope) {
    /**
     * A reference to the currently active scope
     *
     * @type {paper.PaperScope}
     * @private
     */
    this._activeScope = activeScope;

    /**
     * The scope associated with this context
     *
     * @type {paper.PaperScope}
     * @private
     */
    this._scope = new paper.PaperScope();
  }

  /**
   * @param scope
   * @private
   */
  _activateScope(scope) {
    this._activeScope = scope;
    scope.activate();
  }

  /**
   * Set up this context connecting it to a given canvas
   *
   * @param {HTMLCanvasElement} element
   */
  setup(element) {
    this._scope.setup(element);
  }

  /**
   * Execute the given operation within the scope of this drawing context
   *
   * The scope will be passed to the given function
   *
   * @param {Function} operation
   */
  withScope(operation) {
    const oldScope = this._activeScope;

    this._activateScope(this._scope);
    operation(this._scope);
    this._activateScope(oldScope);
  }
}

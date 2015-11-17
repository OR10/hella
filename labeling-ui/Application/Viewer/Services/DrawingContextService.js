import paper from 'paper';
import DrawingContext from '../DrawingContext';

/**
 * Service managing the creation of Paper related DrawingContexts.
 */
class DrawingContextService {
  constructor() {
    /**
     * Reference to the currently active scope
     *
     * @type {paper.PaperScope}
     */
    this._activeScope = paper;
  }

  /**
   * Create a new {@link DrawingContext} in order to manage a certain paper scope
   *
   * @returns {DrawingContext}
   */
  createContext() {
    return new DrawingContext(this._activeScope);
  }

  /**
   * Activate a given {@link DrawingContext}
   *
   * @param {DrawingContext} drawingContext
   */
  activateContext(drawingContext) {
    const scope = drawingContext.scope;
    this._activeScope = scope;
    scope.activate();
  }

  /**
   * Execute operations with a certain active {@link DrawingContext}
   *
   * The provided function will be executed synchronously with the correct `paper.Scope` provided
   *
   * @param drawingContext
   * @param {Function} operation
   */
  withDrawingContext(drawingContext, operation) {
    const oldScope = this._activeScope;
    this.activateContext(drawingContext);
    operation(drawingContext.scope);
    this._activeScope = oldScope;
    this._activeScope.scope();
  }
}

export default DrawingContextService;

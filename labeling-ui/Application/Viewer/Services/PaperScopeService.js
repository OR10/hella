import paper from 'paper';

/**
 * Service to interact with Paper.js Scopes.
 *
 * @class PaperScopeService
 */
export default class PaperScopeService {
  constructor() {
    // Initialize the active scope to the global default scope
    this.activeScope = paper;
    this.activeScope.activate();
  }

  /**
   * @returns {paper.PaperScope}
   */
  get() {
    return this.activeScope;
  }

  /**
   * Activates the given scope making it the current context for all PaperJS operations.
   *
   * Returns the previously set scope as a conveniece feature for easily resetting state.
   *
   * @param {paper.PaperScope} scope
   *
   * @returns {paper.PaperScope}
   */
  activate(scope) {
    const oldScope = this.get();

    this.activeScope = scope;
    this.activeScope.activate();

    return oldScope;
  }
}

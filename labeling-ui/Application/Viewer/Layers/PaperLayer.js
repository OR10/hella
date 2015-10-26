import paper from 'paper';

/**
 * @class PaperLayer
 *
 * @implements {Layer}
 */
export default class PaperLayer {
  /**
   * @param {PaperScopeService} paperScopeService
   */
  constructor(paperScopeService) {
    /**
     * @type {PaperScopeService}
     * @private
     */
    this._paperScopeService = paperScopeService;

    /**
     * @type {paper.PaperScope}
     * @private
     */
    this._paperScope = new paper.PaperScope();

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._element = null;

    const oldScope = this._paperScopeService.activate(this._paperScope);
    this._initializeComponents();
    this._paperScopeService.activate(oldScope);
  }

  /**
   * @abstract
   * @protected
   */
  _initializeComponents() {
  }

  render() {
    const oldScope = this._paperScopeService.activate(this._paperScope);
    this._render();
    this._paperScope.view.draw();
    this._paperScopeService.activate(oldScope);
  }

  /**
   * @abstract
   * @protected
   */
  _render() {
  }

  attachToDom(element) {
    this._element = element;
    this._paperScope.setup(this._element);
  }

  /**
   * @param event
   */
  dispatchDOMEvent(event) {
    // TODO find better solution
    this._dispatchDOMEvent(event);
  }

  /**
   * @param event
   * @abstract
   * @protected
   */
  _dispatchDOMEvent(event) {
  }
}

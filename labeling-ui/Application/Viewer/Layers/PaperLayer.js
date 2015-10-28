/**
 * @class PaperLayer
 *
 * @implements {Layer}
 */
export default class PaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    /**
     * @type {DrawingContext}
     * @protected
     */
    this._context = drawingContextService.createContext();

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._element = null;
  }

  render() {
    this._context.withScope((scope) => {
      this.renderInPaperScope(scope);
    });
  }

  /**
   * @abstract
   * @protected
   */
  renderInPaperScope(scope) { // eslint-disable-line no-unused-vars
  }

  attachToDom(element) {
    this._element = element;
    this._context.setup(element);
  }

  /**
   * @param event
   */
  dispatchDOMEvent(event) { // eslint-disable-line no-unused-vars
  }

  /**
   * Clears the layer removing all items
   */
  clear() {
    this._context.withScope((scope) => {
      scope.project.clear();
      scope.view.update();
    });
  }
}

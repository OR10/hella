import paper from 'paper';

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

    this._context.withScope(() => {
      this.initializeComponentsInPaperScope();
    });
  }

  /**
   * @abstract
   * @protected
   */
  initializeComponentsInPaperScope() {
  }

  render() {
    this._context.withScope(() => {
      this.renderInPaperScope();
    });
  }

  /**
   * @abstract
   * @protected
   */
  renderInPaperScope() {
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
    this._context.withScope(() => {
      paper.project.clear();
      paper.view.update();
    });
  }
}

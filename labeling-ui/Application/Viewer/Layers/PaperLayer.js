import EventEmitter from 'event-emitter';

/**
 * Base class for all layers using PaperJs
 *
 * @class PaperLayer
 *
 * @implements {Layer}
 */
export default class PaperLayer extends EventEmitter {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super();

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
  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
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

  exportData() {
    return this._element.toDataURL();
  }
}

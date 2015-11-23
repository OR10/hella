import EventEmitter from 'event-emitter';

/**
 * Base class for all layers using PaperJs
 *
 * @implements {Layer}
 * @extends EventEmitter
 */
class PaperLayer extends EventEmitter {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   */
  constructor($scope, drawingContextService) {
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
    return this._element.getContext('2d').getImageData(0, 0, this._element.width, this._element.height);
  }
}

export default PaperLayer;

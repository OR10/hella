import EventEmitter from 'event-emitter';
import paper from 'paper';

/**
 * Base class for all layers using PaperJs
 *
 * @implements {Layer}
 * @extends EventEmitter
 */
class PaperLayer extends EventEmitter {
  /**
   * @param {int} width
   * @param {int} height
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   */
  constructor(width, height, $scope, drawingContextService) {
    super();

    /**
     * @type {Number}
     * @protected
     */
    this._height = height;

    /**
     * @type {Number}
     * @protected
     */
    this._width = width;

    /**
     * @type {$rootScope.Scope}
     * @protected
     */
    this._$scope = $scope;

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

    /**
     * @type {number}
     * @protected
     */
    this._scaleToFitZoom = 1;
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
    this._context.withScope(
      scope => this._element.dispatchEvent(event)
    );
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

  resize(width, height) {
    this._context.withScope(scope => {
      scope.view.viewSize = new paper.Size(width, height);

      // Scale the view
      scope.view.center = new paper.Point(0, 0);
      scope.view.zoom = width / this._width;
      scope.view.center = new paper.Point(Math.round(scope.view.size.width / 2), Math.round(scope.view.size.height / 2));

      this._scaleToFitZoom = scope.view.zoom;

      scope.view.update(true);
    });
  }

  get zoom() {
    return this._context.withScope(scope => scope.view.zoom);
  }

  get center() {
    return this._context.withScope(scope => scope.view.center);
  }

  get bounds() {
    return this._context.withScope(scope => scope.view.bounds);
  }

  exportData() {
    return this._element.getContext('2d').getImageData(0, 0, this._element.width, this._element.height);
  }
}

export default PaperLayer;

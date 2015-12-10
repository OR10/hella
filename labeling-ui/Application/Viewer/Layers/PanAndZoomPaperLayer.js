import PaperLayer from './PaperLayer';
import PanAndZoom from '../PanAndZoom/PanAndZoom';
import paper from 'paper';
import angular from 'angular';

/**
 * Special PaperLayer which provides basic pan and zoom functionality
 *
 * @extends PaperLayer
 */
class PanAndZoomPaperLayer extends PaperLayer {
  /**
   * @param {int} width
   * @param {int} height
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   */
  constructor(width, height, $scope, drawingContextService) {
    super(width, height, $scope, drawingContextService);
  }

  attachToDom(element) {
    super.attachToDom(element);

    this._context.withScope(scope => {
      this._panAndZoom = new PanAndZoom(scope.view);
    });

    angular.element(this._element).on('mousewheel', this._handleScroll.bind(this));
    this._element.addEventListener('mousedown', this._handleMouseDown.bind(this));
    this._element.addEventListener('mousemove', this._handleMouseMove.bind(this));
    this._element.addEventListener('mouseup', this._handleMouseUp.bind(this));
    this._element.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
  }

  /**
   * Reset the view's pan and zoom to the original state
   */
  resetZoom() {
    this._context.withScope(scope => {
      this._panAndZoom.zoom(1, scope.view.center);
      this._panAndZoom.setCenter(new paper.Point(
        scope.view.viewSize.width / 2,
        scope.view.viewSize.height / 2
      ));
    });
  }

  /**
   * Zoom the view in on the current center
   */
  zoomIn() {
    this._context.withScope(scope => {
      this._panAndZoom.zoomIn(scope.view.center, 1.5);
    });
  }

  /**
   * Zoom the view out from the current center
   */
  zoomOut() {
    this._context.withScope(scope => {
      this._panAndZoom.zoomOut(scope.view.center, 1.5);
    });
  }

  _zoom(deltaY, focalPointX, focalPointY) {
    const focalPoint = new paper.Point(focalPointX, focalPointY);

    if (deltaY < 0) {
      this._panAndZoom.zoomIn(focalPoint);
    } else if (deltaY > 0) {
      this._panAndZoom.zoomOut(focalPoint);
    }
  }

  _pan(deltaX, deltaY) {
    this._panAndZoom.changeCenter(deltaX, deltaY);
  }

  _handleScroll(event) {
    if (event.altKey) {
      this._zoom(event.deltaY, event.offsetX, event.offsetY);
    }
  }

  _handleMouseDown(event) {
    if (event.shiftKey) {
      this._dragging = true;
      this._lastKnownMousePosition = {x: event.offsetX, y: event.offsetY};
    }
  }

  _handleMouseMove(event) {
    if (this._dragging) {
      const deltaX = this._lastKnownMousePosition.x - event.offsetX;
      const deltaY = this._lastKnownMousePosition.y - event.offsetY;

      this._pan(deltaX, deltaY);

      this._lastKnownMousePosition = {x: event.offsetX, y: event.offsetY};
    }
  }

  _handleMouseUp() {
    this._dragging = false;
  }

  _handleMouseLeave() {
    this._dragging = false;
  }
}

export default PanAndZoomPaperLayer;

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
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   */
  constructor($scope, drawingContextService) {
    super($scope, drawingContextService);
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

  _zoom(deltaY, focalPointX, focalPointY) {
    const focalPoint = new paper.Point(focalPointX, focalPointY);

    this._panAndZoom.changeZoom(deltaY, focalPoint);
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

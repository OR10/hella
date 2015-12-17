import paper from 'paper';
import Tool from './Tool';

/**
 * A Tool for Zooming in and out
 *
 * @extends Tool
 */
class ZoomTool extends Tool {
  /**
   * @param {string} zoomFn
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor(zoomFn, $scope, drawingContext, options) {
    super(drawingContext, options);

    this._zoomFn = zoomFn;
    this._$scope = $scope;

    this._tool.onMouseUp = event => this._$scope.$evalAsync(this._mouseUp.bind(this, event));
  }

  _mouseUp(event) {
    this._$scope.vm[this._zoomFn](
      new paper.Point(
        event.event.offsetX,
        event.event.offsetY
      ),
      1.5
    );
  }

  activate() {
    super.activate();

    const mouseCursor = {
      [ZoomTool.ZOOM_IN]: 'zoom-in',
      [ZoomTool.ZOOM_OUT]: 'zoom-out',
    };

    this._$scope.$evalAsync(() => this._$scope.vm.actionMouseCursor = mouseCursor[this._zoomFn]);
  }
}

ZoomTool.ZOOM_IN = 'zoomIn';
ZoomTool.ZOOM_OUT = 'zoomOut';

export default ZoomTool;

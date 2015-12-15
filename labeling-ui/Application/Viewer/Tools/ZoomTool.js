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

    this._tool.onMouseUp = this._mouseUp.bind(this);
  }

  _mouseUp() {
    this._$scope.$apply(
      () => this._$scope.vm.viewport[this._zoomFn](1.5)
    );
  }
}

ZoomTool.ZOOM_IN = 'zoomIn';
ZoomTool.ZOOM_OUT = 'zoomOut';

export default ZoomTool;

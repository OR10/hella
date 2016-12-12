import Tool from '../Tool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PolygonScaleTool extends Tool {
  /**
   * @param $scope
   * @param {DrawingContext} drawingContext
   * @param {LoggerService} loggerService
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, loggerService, options) {
    super(drawingContext, loggerService, options);
    /**
     * @type {angular.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;

    /**
     * Variable that holds the drag handle
     *
     * @type {Handle|null}
     * @private
     */
    this._activeHandle = null;
  }

  onMouseDown(event, hitShape, hitHandle) {
    this._paperPolygon = hitShape;
    this._activeHandle = hitHandle;
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._paperPolygon && this._modified) {
      this._modified = false;
      this.emit('shape:update', this._paperPolygon);
    }

    this._activeHandle = null;
    this._paperPolygon = null;
  }

  onMouseDrag(event) {
    if (!this._paperPolygon || this._activeHandle === null) {
      return;
    }
    const point = event.point;
    this._modified = true;

    this._$scope.$apply(() => {
      this._context.withScope(() => {
        this._paperPolygon.resize(this._activeHandle, point);
      });
    });
  }
}

export default PolygonScaleTool;

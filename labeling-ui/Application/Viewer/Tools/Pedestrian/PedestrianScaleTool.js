import Tool from '../Tool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PedestrianScaleTool extends Tool {
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

    /**
     * Position of the initial mouse down of one certain scaling operation
     *
     * @type {paper.Point|null}
     * @private
     */
    this._startPoint = null;
  }

  onMouseDown(event, hitShape, hitHandle) {
    this._paperPedestrian = hitShape;
    this._activeHandle = hitHandle;
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._paperPedestrian && this._modified) {
      this._modified = false;
      this._paperPedestrian.fixOrientation();
      this.emit('shape:update', this._paperPedestrian);
    }

    this._activeHandle = null;
    this._paperPedestrian = null;
  }

  onMouseDrag(event) {
    if (!this._paperPedestrian || this._activeHandle === null) {
      return;
    }
    const point = event.point;
    this._modified = true;

    const drawingToolOptions = this._$scope.vm.task.drawingToolOptions;
    const minimalHeight = (drawingToolOptions && drawingToolOptions.rectangle && drawingToolOptions.rectangle.minimalHeight)
      ? drawingToolOptions.rectangle.minimalHeight
      : 1;

    this._$scope.$apply(() => {
      this._context.withScope(() => {
        this._paperPedestrian.resize(this._activeHandle, point, minimalHeight);
      });
    });
  }
}

export default PedestrianScaleTool;

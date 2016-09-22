import Tool from '../Tool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class RectangleScaleTool extends Tool {
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
    this._paperRectangle = hitShape;
    this._activeHandle = hitHandle;
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._paperRectangle && this._modified) {
      this._modified = false;
      this._paperRectangle.fixOrientation();
      this.emit('shape:update', this._paperRectangle);

      if (!this._paperRectangle.toJSON().topLeft.x
        || !this._paperRectangle.toJSON().topLeft.y
        || !this._paperRectangle.toJSON().bottomRight.x
        || !this._paperRectangle.toJSON().bottomRight.y) {
        this.logger.warn('tool:rectangle:scale:finish', 'Rectangle scale coords broken', this._paperRectangle);
      }
    }

    this._activeHandle = null;
    this._paperRectangle = null;
  }

  onMouseDrag(event) {
    if (!this._paperRectangle || this._activeHandle === null) {
      return;
    }
    const point = event.point;
    this._modified = true;

    const drawingToolOptions = this._$scope.vm.task.drawingToolOptions;
    const minimalHeight = (drawingToolOptions && drawingToolOptions.rectangle && drawingToolOptions.rectangle.minimalHeight)
      ? drawingToolOptions.rectangle.minimalHeight
      : {width: 1, height: 1};

    this._$scope.$apply(() => {
      this._context.withScope(() => {
        this._paperRectangle.resize(this._activeHandle, point, minimalHeight);

        if (!this._paperRectangle.toJSON().topLeft.x
          || !this._paperRectangle.toJSON().topLeft.y
          || !this._paperRectangle.toJSON().bottomRight.x
          || !this._paperRectangle.toJSON().bottomRight.y) {
          this.logger.warn('tool:rectangle:scale:perform', 'Rectangle scale coords broken', this._paperRectangle);
        }
      });
    });
  }
}

export default RectangleScaleTool;

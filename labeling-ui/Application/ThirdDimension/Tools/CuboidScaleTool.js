import Tool from '../../Viewer/Tools/Tool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class CuboidScaleTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);
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
     * Variable that holds the string representation of the drag handle position
     *
     * @type {string}
     * @private
     */
    this._boundName = null;
  }

  onMouseDown(event, hitResult) {
    if (hitResult) {
      this._paperCuboid = hitResult.parent;
      this._boundName = hitResult.name;
    }
  }

  onMouseUp() {
    if (this._paperCuboid && this._modified) {
      this._modified = false;
      // this._paperCuboid.fixOrientation();
      // this.emit('shape:update', this._paperCuboid);
    }

    this._boundName = null;
    this._paperCuboid = null;
  }

  onMouseDrag(event) {
    if (!this._paperCuboid) {
      return;
    }
    const point = event.point;
    this._modified = true;

    const drawingToolOptions = this._$scope.vm.task.drawingToolOptions;
    const minimalSize = (drawingToolOptions && drawingToolOptions.cuboid && drawingToolOptions.cuboid.minimalSize)
      ? drawingToolOptions.cuboid.minimalSize
      : {width: 1, height: 1, length: 1};

    this._$scope.$apply(() => {
      this._context.withScope(() => {
        this._paperCuboid.resize(this._boundName, point, minimalSize);
      });
    });
  }
}

export default CuboidScaleTool;

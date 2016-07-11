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
    const defaultOptions = {
      minimalHeight: 15,
    };
    super(drawingContext, Object.assign({}, defaultOptions, options));
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
     * @type {PaperCuboid|null}
     * @private
     */
    this._paperCuboid = null;
  }

  onMouseDown(event, hitShape, hitHandle) {
    this._paperCuboid = hitShape;
    this._activeHandle = hitHandle;
    this._paperCuboid.updatePrimaryCorner();
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._paperCuboid && this._modified) {
      this._modified = false;
      this._paperCuboid.updatePrimaryCorner();
      this._paperCuboid.reduceToPseudo3dIfPossible();
      this.emit('shape:update', this._paperCuboid);
    }

    this._activeHandle = null;
    this._paperCuboid = null;
  }

  onMouseDrag(event) {
    if (!this._paperCuboid || !this._activeHandle) {
      return;
    }
    const point = event.point;
    this._modified = true;

    this._$scope.$apply(() => {
      this._context.withScope(() => {
        this._paperCuboid.resize(this._activeHandle, point, this._options.minimalHeight);
      });
    });
  }
}

export default CuboidScaleTool;

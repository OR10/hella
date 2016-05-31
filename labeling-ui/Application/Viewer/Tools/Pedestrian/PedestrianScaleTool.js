import Tool from '../Tool';
import paper from 'paper';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PedestrianScaleTool extends Tool {
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

    /**
     * Position of the initial mouse down of one certain scaling operation
     *
     * @type {paper.Point|null}
     * @private
     */
    this._startPoint = null;
  }

  onMouseDown(event, hitResult) {
    if (hitResult) {
      this._paperPedestrian = hitResult.parent;
      this._boundName = hitResult.name;
    }
  }

  onMouseUp() {
    if (this._paperPedestrian && this._modified) {
      this._modified = false;
      this._paperPedestrian.fixOrientation();
      this.emit('shape:update', this._paperPedestrian);
    }

    this._boundName = null;
    this._paperPedestrian = null;
  }

  onMouseDrag(event) {
    if (!this._paperPedestrian || this._scaleAnchor === null) {
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
        this._paperPedestrian.resize(this._boundName, point, minimalHeight);
      });
    });
  }
}

export default PedestrianScaleTool;

import Tool from './Tool';
import paper from 'paper';
import PaperCircle from '../Shapes/PaperCircle';
import PaperPedestrian from '../Shapes/PaperPedestrian';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class RectangleScaleTool extends Tool {
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
     * Hit test result
     *
     * @type {HitResult}
     * @private
     */
    this._hitResult = null;

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
      this._paperShape = hitResult.parent;
      this._boundName = hitResult.name;
    }
  }

  onMouseUp() {
    if (this._hitResult && this._modified) {
      this._modified = false;
      this.emit('shape:update', this._hitResult.item);
    }

    this._boundName = null;
    this._paperShape = null;
  }

  onMouseDrag(event) {
    if (!this._paperShape || this._scaleAnchor === null) {
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
        this._paperShape.scale(this._boundName, point, minimalHeight);
      });
    });
  }
}

export default RectangleScaleTool;

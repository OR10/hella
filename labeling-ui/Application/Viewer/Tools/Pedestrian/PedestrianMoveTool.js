import paper from 'paper';
import Tool from '../Tool';

/**
 * A Tool for moving annotation shapes
 *
 * @extends Tool
 * @implements ToolEvents
 */
class PedestrianMoveTool extends Tool {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * Currently active shape
     *
     * @type {paper.Shape|null}
     * @private
     */
    this._paperPedestrian = null;

    /**
     * Mouse to center offset for moving a shape
     *
     * @type {Point}
     * @private
     */
    this._offset = null;

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;
  }

  /**
   * @param {Object} event
   * @param {PaperShape} hitShape
   */
  onMouseDown(event, hitShape) {
    const point = event.point;

    this._paperPedestrian = hitShape.parent;
    this._offset = new paper.Point(
      this._paperPedestrian.position.x - point.x,
      this._paperPedestrian.position.y - point.y
    );
  }

  onMouseUp() {
    if (this._paperPedestrian) {
      if (this._modified) {
        this._modified = false;

        this.emit('shape:update', this._paperPedestrian);
      }
    }

    this._offset = null;
  }

  /**
   * @param event
   */
  onMouseDrag(event) {
    if (!this._paperPedestrian) {
      return;
    }
    const point = event.point;

    this._modified = true;
    this._moveTo(this._paperPedestrian, point.add(this._offset));
  }

  /**
   * @param {PaperShape} shape
   * @param {paper.Point} point
   * @private
   */
  _moveTo(shape, point) {
    this._context.withScope(() => {
      shape.moveTo(this._restrictToViewport(shape, point));
    });
    this.emit('shape:update', shape);
  }

  /**
   * Restrict the position of the paper shape to within the bounds of the view
   *
   * The provided as well as returned point is supposed to be the center point of the shape.
   *
   * @param {PaperShape} shape
   * @param {paper.Point} point
   * @returns {paper.Point}
   * @private
   */
  _restrictToViewport(shape, point) {
    const viewWidth = this._$scope.vm.viewport.bounds.width * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const viewHeight = this._$scope.vm.viewport.bounds.height * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const shapeWidth = shape.bounds.width;
    const shapeHeight = shape.bounds.height;

    let minimalVisibleShapeOverflowX = this._$scope.vm.task.minimalVisibleShapeOverflow;
    let minimalVisibleShapeOverflowY = this._$scope.vm.task.minimalVisibleShapeOverflow;

    if (minimalVisibleShapeOverflowX === null) {
      minimalVisibleShapeOverflowX = shapeWidth;
    }

    if (minimalVisibleShapeOverflowY === null) {
      minimalVisibleShapeOverflowY = shapeHeight;
    }

    const minX = (shapeWidth / 2) - (shapeWidth - minimalVisibleShapeOverflowX);
    const maxX = viewWidth - (shapeWidth / 2) + (shapeWidth - minimalVisibleShapeOverflowX);
    const minY = (shapeHeight / 2) - (shapeHeight - minimalVisibleShapeOverflowY);
    const maxY = viewHeight - (shapeHeight / 2) + (shapeHeight - minimalVisibleShapeOverflowY);

    return new paper.Point(
      this._clampTo(minX, maxX, point.x),
      this._clampTo(minY, maxY, point.y)
    );
  }

  /**
   * Clamp a value to a given range
   *
   * @param {number} minClamp
   * @param {number} maxClamp
   * @param {number} value
   * @private
   */
  _clampTo(minClamp, maxClamp, value) {
    return Math.max(minClamp, Math.min(maxClamp, value));
  }
}

export default PedestrianMoveTool;
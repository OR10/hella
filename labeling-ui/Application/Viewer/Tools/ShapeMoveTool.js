import paper from 'paper';
import Tool from './Tool';

/**
 * A Tool for moving annotation shapes
 *
 * @extends Tool
 * @implements ToolEvents
 */
export default class ShapeMoveTool extends Tool {
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
    this._paperShape = null;

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

  onMouseDown(event, hitResult) {
    const point = event.point;

    this._paperShape = hitResult.item;
    this._offset = new paper.Point(
      this._paperShape.position.x - point.x,
      this._paperShape.position.y - point.y
    );
  }

  onMouseUp() {
    if (this._paperShape) {
      if (this._modified) {
        this._modified = false;

        this.emit('shape:update', this._paperShape);
      }
    }

    this._offset = null;
  }

  onMouseDrag(event) {
    if (!this._paperShape) {
      return;
    }
    const point = event.point;

    this._modified = true;
    this.moveTo(this._paperShape, point.add(this._offset));
  }

  moveTo(shape, point) {
    this._context.withScope(scope => {
      shape.moveTo(this._restrictToViewport(shape, point));
      scope.view.update();
    });
    this.emit('shape:update', shape);
  }

  /**
   * Restrict the position of the paper shape to within the bounds of the view
   *
   * @param {paper.Point} point
   * @returns {paper.Point}
   * @private
   */
  _restrictToViewport(shape, point) {
    const viewWidth = this._$scope.vm.viewport.bounds.width * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const viewHeight = this._$scope.vm.viewport.bounds.height * this._$scope.vm.viewport.zoom / this._$scope.vm.viewport.getScaleToFitZoom();
    const shapeWidth = shape.bounds.width;
    const shapeHeight = shape.bounds.height;

    let correctedX = point.x;
    let correctedY = point.y;

    if (point.x - shapeWidth / 2 < 0) {
      correctedX = shapeWidth / 2;
    }

    if (point.y - shapeHeight / 2 < 0) {
      correctedY = shapeHeight / 2;
    }

    if (point.x + shapeWidth / 2 > viewWidth) {
      correctedX = viewWidth - shapeWidth / 2;
    }

    if (point.y + shapeHeight / 2 > viewHeight) {
      correctedY = viewHeight - shapeHeight / 2;
    }

    return new paper.Point(correctedX, correctedY);
  }

}

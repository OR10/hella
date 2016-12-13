import paper from 'paper';
import Tool from '../Tool';

/**
 * A Tool for moving annotation shapes
 *
 * @extends Tool
 * @implements ToolEvents
 */
class PolygonMoveTool extends Tool {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {LoggerService} loggerService
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, loggerService, options) {
    super(drawingContext, loggerService, options);

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
    this._paperPolygon = null;

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

    this._paperPolygon = hitShape;
    this._offset = new paper.Point(
      this._paperPolygon.position.x - point.x,
      this._paperPolygon.position.y - point.y
    );
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._paperPolygon) {
      if (this._modified) {
        this._modified = false;

        this.emit('shape:update', this._paperPolygon);
      }
    }

    this._offset = null;
  }

  /**
   * @param event
   */
  onMouseDrag(event) {
    if (!this._paperPolygon) {
      return;
    }
    const point = event.point;

    this._modified = true;
    this._moveTo(this._paperPolygon, point.add(this._offset));
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
}

export default PolygonMoveTool;

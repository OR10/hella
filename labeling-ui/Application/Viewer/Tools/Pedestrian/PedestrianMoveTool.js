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

    this._paperPedestrian = hitShape;
    this._offset = new paper.Point(
      this._paperPedestrian.position.x - point.x,
      this._paperPedestrian.position.y - point.y
    );
  }

  onMouseUp() {
    this.emit('tool:finished');
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

    if (!shape.topCenter.x || !shape.topCenter.y || !shape.bottomCenter.x || !shape.bottomCenter.y) {
      this.logger.warn('tool:pedestrian:move:finish', 'Pedestrian move coords broken', shape);
    }

    this.emit('shape:update', shape);
  }
}

export default PedestrianMoveTool;

import Tool from '../../Viewer/Tools/Tool';
import paper from 'paper';

/**
 * A Tool for moving annotation shapes
 *
 * @extends Tool
 * @implements ToolEvents
 */
class CuboidMoveTool extends Tool {
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
    this._paperCuboid = null;

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;

    /**
     * Mouse to center offset for moving a shape
     *
     * @type {Point}
     * @private
     */
    this._offset = null;
  }

  /**
   * @param {Object} event
   * @param {PaperShape} hitShape
   */
  onMouseDown(event, hitShape) {
    this._paperCuboid = hitShape;
    this._paperCuboid.updatePrimaryCorner();

    this._offset = new paper.Point(
      this._paperCuboid.position.x - event.point.x,
      this._paperCuboid.position.y - event.point.y
    );
  }

  onMouseUp() {
    this.emit('shape:finished');
    if (this._paperCuboid && this._modified) {
      this._modified = false;
      this._paperCuboid.updatePrimaryCorner();

      this.emit('shape:update', this._paperCuboid);
    }

    this._offset = null;
  }

  /**
   * @param event
   */
  onMouseDrag(event) {
    if (!this._paperCuboid) {
      return;
    }
    const point = event.point;

    this._modified = true;
    this._moveTo(this._paperCuboid, point.add(this._offset));
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

export default CuboidMoveTool;

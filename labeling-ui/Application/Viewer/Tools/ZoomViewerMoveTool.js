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
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);
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

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
  }

  _mouseDown(event) {
    const point = event.point;

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._paperShape = hitResult.item;
        this._offset = new paper.Point(
          this._paperShape.position.x - point.x,
          this._paperShape.position.y - point.y
        );
      } else {
        this._paperShape = null;
      }
    });
  }

  _mouseDrag(event) {
    if (!this._paperShape) {
      return;
    }
    const point = event.point;

    const newPoint = point.add(this._offset);

    if (newPoint.x !== this._paperShape.position.x || newPoint.y !== this._paperShape.position.y) {
      this._paperShape.position = newPoint;
      this.emit('shape:update', this._paperShape);
    }
  }

}

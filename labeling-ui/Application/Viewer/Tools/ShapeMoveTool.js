import paper from 'paper';
import Tool from './Tool';
import PaperShape from '../Shapes/PaperShape';

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
    this._paperShape.moveTo(point.add(this._offset));
  }

}

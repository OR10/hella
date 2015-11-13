import paper from 'paper';
import Tool from './Tool';

/**
 * A Tool for moving annotation shapes
 */
export default class ShapeMoveTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);
    /**
     * Hit test result
     *
     * @type {HitResult}
     * @private
     */
    this._hitResult = null;
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

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
  }

  _mouseDown(event) {
    this._deselectCurrentSelection();

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(event.point, {
        fill: true,
        bounds: true,
        segments: true,
        curves: true,
        center: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._hitResult = hitResult;
        this._hitResult.item.selected = true;
        this._offset = new paper.Point(
          this._hitResult.item.position.x - event.point.x,
          this._hitResult.item.position.y - event.point.y
        );
      } else {
        this._hitResult = null;
      }
    });
  }

  _deselectCurrentSelection() {
    if (this._hitResult && this._hitResult.item) {
      this._hitResult.item.selected = false;
    }
  }

  _mouseUp() {
    if (this._hitResult && this._hitResult.item) {
      if (this._modified) {
        this.emit('shape:update', this._hitResult.item);
        this._modified = false;
      } else {
        this.emit('shape:selected', this._hitResult.item);
      }
    } else {
      this.emit('shape:deselected');
    }

    this._offset = null;
  }

  _mouseDrag(event) {
    if (!this._hitResult) return;

    this._modified = true;
    this._moveTo(this._hitResult.item, event.point);
  }

  _moveTo(item, centerPoint) {
    item.position = centerPoint.add(this._offset);
  }
}

import paper from 'paper';
import Tool from './Tool';
import PaperShape from '../Shapes/PaperShape';

/**
 * A Tool for moving annotation shapes
 *
 * @extends Tool
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

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
  }

  selectShape(paperShape) {
    this._paperShape = paperShape;
    this._paperShape.select();
  }

  _mouseDown(event) {
    const point = event.point;
    this._deselectCurrentSelection();

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        class: PaperShape,
        fill: true,
        bounds: true,
        segments: true,
        curves: true,
        center: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._paperShape = hitResult.item;
        this._paperShape.select();
        this._offset = new paper.Point(
          this._paperShape.position.x - point.x,
          this._paperShape.position.y - point.y
        );
      } else {
        this._paperShape = null;
      }
    });
  }

  _deselectCurrentSelection() {
    if (this._paperShape) {
      this._paperShape.deselect();
    }
  }

  _mouseUp() {
    if (this._paperShape) {
      if (this._modified) {
        this._modified = false;

        this.emit('shape:update', this._paperShape);
      } else {
        this.emit('shape:selected', this._paperShape);
      }
    } else {
      this.emit('shape:deselected');
    }

    this._offset = null;
  }

  _mouseDrag(event) {
    if (!this._paperShape) {
      return;
    }
    const point = event.point;

    this._modified = true;
    this._paperShape.moveTo(point.add(this._offset));
  }

}

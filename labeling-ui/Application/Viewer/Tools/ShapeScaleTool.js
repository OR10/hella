import paper from 'paper';
import Tool from './Tool';

/**
 * A Tool for scaling annotation shapes
 */
export default class ShapeScaleTool extends Tool {
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
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._hitResult = hitResult;
        this._hitResult.item.selected = true;

        if (this._hitResult.type === 'bounds') {
          this._scaleAnchor = this._getScaleAnchor(event.point, this._hitResult.item);
        }
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

    this._scaleAnchor = null;
  }

  _mouseDrag(event) {
    if (!this._hitResult) return;

    this._modified = true;
    this._scale(this._hitResult.item, event.point);
  }

  /**
   * TODO: If the drag handle is dragged fast over the scale anchor the scale anchor
   * moves in the opposite of the drag direction.
   * The movement size is speed dependent!
   */
  _scale(item, dragPoint) {
    const width = Math.abs(dragPoint.x - this._scaleAnchor.x) || 1;
    const height = Math.abs(dragPoint.y - this._scaleAnchor.y) || 1;

    const scaleX = width / item.bounds.width || 1;
    const scaleY = height / item.bounds.height || 1;

    item.scale(scaleX, scaleY, this._scaleAnchor);

    this._scaleAnchor = this._getScaleAnchor(dragPoint, item);
  }

  _getScaleAnchor(dragHandle, item) {
    if (dragHandle.x > item.position.x && dragHandle.y > item.position.y) {
      return this._hitResult.item.bounds.topLeft;
    }

    if (dragHandle.x <= item.position.x && dragHandle.y > item.position.y) {
      return this._hitResult.item.bounds.topRight;
    }

    if (dragHandle.x <= item.position.x && dragHandle.y <= item.position.y) {
      return this._hitResult.item.bounds.bottomRight;
    }

    return this._hitResult.item.bounds.bottomLeft;
  }
}

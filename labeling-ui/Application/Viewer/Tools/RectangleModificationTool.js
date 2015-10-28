import paper from 'paper';
import Tool from './Tool';

/**
 * @class RectangleModificationTool
 */
export default class RectangleModificationTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
  }

  _mouseDown(event) {
    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(event.point, {
        fill: true,
        bounds: true,
        tolerance: this._options.hitTestTolerance,
      });
      if (hitResult) {
        this._hitResult = hitResult;

        switch (this._hitResult.type) {
          case 'fill':
            this._hitResult.item.selected = true;
            this._offset = new paper.Point(
              this._hitResult.item.position.x - event.point.x,
              this._hitResult.item.position.y - event.point.y
            );
            break;
          default:
        }
      }
    });
  }

  _mouseUp() {
    if (this._hitResult && this._hitResult.item) {
      this.emit('rectangle:update', this._hitResult.item);
    }
    this._hitResult = null;
  }

  _mouseDrag(event) {
    if (!this._hitResult) return;

    switch (this._hitResult.type) {
      case 'segment':
        console.log('segment');
        break;
      case 'fill':
        this._moveTo(this._hitResult.item, event.point);
        break;
      default:
    }
  }

  _moveTo(item, point) {
    item.position = point.add(this._offset);
  }
}
import paper from 'paper';
import EventEmitter from 'event-emitter';
import RectangleRenderer from '../Renderer/RectangleRenderer';

/**
 * @class RectangleDrawingTool
 */
export default class RectangleDrawingTool extends EventEmitter {
  /**
   * @param {DrawingContext} drawingContext
   */
  constructor(drawingContext) {
    super();

    this._context = drawingContext;
    this._renderer = new RectangleRenderer();

    this._rect = null;
    this._startPosition = null;

    this._context.withScope(() => {
      this._tool = new paper.Tool();
    });

    this._tool.onMouseDown = this._startNewRect.bind(this);
    this._tool.onMouseDrag = this._updateRect.bind(this);
    this._tool.onMouseUp = this._completeRect.bind(this);
  }

  _startNewRect(event) {
    this._startPosition = event.point;

    this._context.withScope(() => {
      this._rect = this._renderer.drawRectangle(
        this._startPosition,
        new paper.Point(
          this._startPosition.x + 1,
          this._startPosition.y + 1
        ),
        {
          strokeColor: 'red',
          strokeWidth: 2,
          // Required to make rect clickable
          fillColor: new paper.Color(0, 0, 0, 0),
        }
      );
    });

    this.emit('rectangle:new', this._rect);
  }

  _updateRect(event) {
    const point = event.point;

    const width = Math.abs(point.x - this._startPosition.x) || 1;
    const height = Math.abs(point.y - this._startPosition.y) || 1;

    const scaleX = width / this._rect.bounds.width || 1;
    const scaleY = height / this._rect.bounds.height || 1;

    this._rect.scale(scaleX, scaleY, this._getScaleAnchor(point));

    this.emit('rectangle:update', this._rect);
  }

  _completeRect(event) {
    this.emit('rectangle:complete', this._rect);
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topLeft;
    } else if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topRight;
    } else if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return this._rect.bounds.bottomRight;
    } else {
      return this._rect.bounds.bottomLeft;
    }
  }
}

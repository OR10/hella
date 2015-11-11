import paper from 'paper';
import Tool from './Tool';
import RectangleRenderer from '../Renderer/RectangleRenderer';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 */
export default class RectangleDrawingTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

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

    // PaperJs doesn't deal well with single point rectangles so we cheat a little on the first draw
    const endPosition = new paper.Point(
      this._startPosition.x + 1,
      this._startPosition.y + 1
    );

    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeScaling: false,
      // Required to make rect clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    };

    this._context.withScope(() => {
      this._rect = this._renderer.drawRectangle(this._startPosition, endPosition, drawingOptions);
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

  _completeRect() {
    this.emit('rectangle:complete', this._rect);
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topLeft;
    }

    if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topRight;
    }

    if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return this._rect.bounds.bottomRight;
    }

    return this._rect.bounds.bottomLeft;
  }
}

import paper from 'paper';
import Tool from './Tool';
import EllipseRenderer from '../Renderer/EllipseRenderer';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 */
export default class EllipseDrawingTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

    this._renderer = new EllipseRenderer();

    this._ellipse = null;
    this._startPosition = null;

    this._context.withScope(() => {
      this._tool = new paper.Tool();
    });

    this._tool.onMouseDown = this._startNewEllipse.bind(this);
    this._tool.onMouseDrag = this._updateEllipse.bind(this);
    this._tool.onMouseUp = this._completeEllipse.bind(this);
  }

  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const size = new paper.Point(1, 1);

    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      // Required to make ellipse clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    };

    this._context.withScope(() => {
      this._ellipse = this._renderer.drawEllipse(this._startPosition, size, drawingOptions);
    });

    this.emit('ellipse:new', this._ellipse);
  }

  _updateEllipse(event) {
    const point = event.point;

    const width = Math.abs(point.x - this._startPosition.x) || 1;
    const height = Math.abs(point.y - this._startPosition.y) || 1;

    const scaleX = width / this._ellipse.bounds.width || 1;
    const scaleY = height / this._ellipse.bounds.height || 1;
    this._ellipse.scale(scaleX, scaleY, this._getScaleAnchor(point));

    this.emit('ellipse:update', this._ellipse);
  }

  _completeEllipse() {
    this.emit('ellipse:complete', this._ellipse);
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return this._ellipse.bounds.topLeft;
    }

    if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return this._ellipse.bounds.topRight;
    }

    if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return this._ellipse.bounds.bottomRight;
    }

    return this._ellipse.bounds.bottomLeft;
  }
}

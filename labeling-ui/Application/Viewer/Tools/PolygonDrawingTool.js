import paper from 'paper';
import Tool from './Tool';
import PolygonRenderer from '../Renderer/PolygonRenderer';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @class PolygonDrawingTool
 */
export default class PolygonDrawingTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

    this.pointCount = 0;

    if (this._options.line) {
      this._renderer = new PolygonRenderer({closed: false});
    } else {
      this._renderer = new PolygonRenderer({closed: this._options.closed});
    }

    this._path = null;

    this._context.withScope(() => {
      this._tool = new paper.Tool();
    });

    this._tool.onMouseUp = this._addPoint.bind(this);
  }

  _addPoint(event) {
    const point = event.point;

    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      // Required to make polygon clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    };

    if (this._options.line && this.pointCount >= 2) {
      this.emit('line:complete', this._path);
      return;
    }

    if (event.event.altKey && this._path) {
      this.emit('polygon:complete', this._path);
      return;
    }

    if (!this._path) {
      this._context.withScope(() => {
        this._path = this._renderer.drawPolygon([point], drawingOptions);
      });
      this.pointCount++;
      this.emit('polygon:new', this._path);
      this.emit('line:new', this._path);
    } else {
      this._path.add(event.point);
      this.pointCount++;
      this.emit('polygon:update', this._path);
      this.emit('line:update', this._path);
    }
  }
}

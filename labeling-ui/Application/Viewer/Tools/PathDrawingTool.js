import paper from 'paper';
import Tool from './Tool';
import PathRenderer from '../Renderer/PathRenderer';

/**
 * A tool for drawing a path with the mouse cursor
 */
export default class PathDrawingTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

    this._renderer = new PathRenderer();
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
    };

    if (event.event.altKey) {
      this.emit('path:complete', this._path);
      return;
    }

    if (!this._path) {
      this._draw(point, drawingOptions);
      this.emit('path:new', this._path);
    } else {
      this._path.add(new paper.Point(event.event.offsetX, event.event.offsetY));
      this.emit('path:update', this._path);
    }
  }

  _draw(point, drawingOptions) {
    this._context.withScope(() => {
      this._path = this._renderer.drawPath([point], drawingOptions);
    });
  }

  _cleanUp() {
    this._path = null;
  }
}

import PathDrawingTool from './PathDrawingTool';
import paper from 'paper';

/**
 * A tool for drawing a path with the mouse cursor
 */
export default class LineDrawingTool extends PathDrawingTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);
    this._startPoint = null;
  }

  _addPoint(event) {
    const point = new paper.Point(event.event.offsetX, event.event.offsetY);
    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
    };

    if (!this._path) {
      this._startPoint = point;
      this._draw(this._startPoint, drawingOptions);
      this.emit('path:new', this._path);
    } else {
      this._path.add(point);
      this.emit('path:complete', this._path);
      this._cleanUp();
    }
  }
}

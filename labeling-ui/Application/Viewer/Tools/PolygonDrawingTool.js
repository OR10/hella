import paper from 'paper';
import PathDrawingTool from './PathDrawingTool';

/**
 * A tool for drawing a path with the mouse cursor
 */
export default class PolygonDrawingTool extends PathDrawingTool {
  _draw(point, drawingOptions) {
    drawingOptions = Object.assign({}, drawingOptions, {
      // Required to make polygon clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    });
    this._context.withScope(() => {
      this._path = this._renderer.drawPolygon([point], drawingOptions);
    });
  }
}

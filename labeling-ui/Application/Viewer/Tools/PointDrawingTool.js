import paper from 'paper';
import EllipseDrawingTool from './EllipseDrawingTool';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 */
export default class PointDrawingTool extends EllipseDrawingTool {
  _startNewEllipse(event) {
    this._startPosition = new paper.Point(event.event.offsetX, event.event.offsetY);

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;
    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 1,
      // Required to make ellipse clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    };

    this._context.withScope(() => {
      this._ellipse = this._renderer.drawCircle(this._startPosition, radius, drawingOptions);
    });

    this.emit('point:new', this._ellipse);
  }

  _updateEllipse() {
  }

  _completeEllipse() {
    this.emit('point:complete', this._ellipse);
    this._ellipse = null;
  }
}

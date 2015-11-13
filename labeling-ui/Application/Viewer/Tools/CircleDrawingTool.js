import paper from 'paper';
import EllipseDrawingTool from './EllipseDrawingTool';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 */
export default class CircleDrawingTool extends EllipseDrawingTool {
  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;
    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      // Required to make ellipse clickable
      fillColor: new paper.Color(0, 0, 0, 0),
    };

    this._context.withScope(() => {
      this._ellipse = this._renderer.drawCircle(this._startPosition, radius, drawingOptions);
    });

    this.emit('ellipse:new', this._ellipse);
  }

  _updateEllipse(event) {
    const point = event.point;
    const distance = this._startPosition.getDistance(point);
    const scale = distance / this._ellipse.bounds.width || 1;

    this._ellipse.scale(scale);
    this._ellipse.position = new paper.Point((this._startPosition.x + point.x) / 2, (this._startPosition.y + point.y) / 2);

    this.emit('ellipse:update', this._ellipse);
  }

  _completeEllipse() {
    this.emit('ellipse:complete', this._ellipse);
  }
}

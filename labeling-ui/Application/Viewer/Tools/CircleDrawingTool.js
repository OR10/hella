import paper from 'paper';
import EllipseDrawingTool from './EllipseDrawingTool';
import PaperCircle from '../Shapes/PaperCircle';
import uuid from 'uuid';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @class CircleDrawingTool
 * @extends EllipseDrawingTool
 */
class CircleDrawingTool extends EllipseDrawingTool {
  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;

    this._context.withScope(() => {
      this._shape = new PaperCircle(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, this._startPosition, radius, 'red');
      this._shape.select();
    });

    this.emit('circle:new', this._shape);
  }

  _updateEllipse(event) {
    const point = event.point;
    const distance = this._startPosition.getDistance(point);
    const scale = distance / this._shape.bounds.width || 1;

    this._shape.scale(scale);
    this._shape.moveTo(new paper.Point((this._startPosition.x + point.x) / 2, (this._startPosition.y + point.y) / 2));

    this.emit('circle:update', this._shape);
  }

  _completeEllipse() {
    this.emit('circle:complete', this._shape);
  }
}

export default CircleDrawingTool;

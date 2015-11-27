import CircleDrawingTool from './CircleDrawingTool';
import PaperCircle from '../Shapes/PaperCircle';
import uuid from 'uuid';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 */
export default class PointDrawingTool extends CircleDrawingTool {
  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;

    this._context.withScope(() => {
      this._shape = new PaperCircle(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, this._startPosition, radius, 'red');
    });

    this.emit('point:new', this._shape);
  }

  _updateEllipse() {
  }

  _completeEllipse() {
    this.emit('shape:new', this._shape);
    this._shape = null;
  }
}

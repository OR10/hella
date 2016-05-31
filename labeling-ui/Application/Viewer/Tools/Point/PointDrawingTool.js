import CircleDrawingTool from '../Circle/CircleDrawingTool';
import PaperCircle from '../../Shapes/PaperCircle';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @extends CircleDrawingTool
 */
class PointDrawingTool extends CircleDrawingTool {
  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._shape = new PaperCircle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        this._startPosition,
        radius,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this.emit('point:new', this._shape);
  }

  _updateEllipse() {
    // Nothing to update!
  }

}

export default PointDrawingTool;

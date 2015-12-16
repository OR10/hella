import PathDrawingTool from './PathDrawingTool';
import PaperLine from '../Shapes/PaperLine';

/**
 * A tool for drawing a path with the mouse cursor
 *
 * @extends PathDrawingTool
 */
class LineDrawingTool extends PathDrawingTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(drawingContext, options, entityIdService, entityColorService) {
    super(drawingContext, options, entityIdService, entityColorService);
    this._startPoint = null;
  }

  _addPoint(event) {
    const point = event.point;

    if (!this._path) {
      this._startPoint = point;
      this._draw(this._startPoint);
      this.emit('path:new', this._path);
    } else {
      this._path.add(point);

      // Ensure the parent/child structure is intact
      const labeledThingInFrame = this._path.labeledThingInFrame;
      labeledThingInFrame.shapes.push(this._path.toJSON());

      this.emit('shape:new', this._path);
      this._path = null;
    }
  }

  _draw(point) {
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._path = new PaperLine(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        [point],
        labeledThingInFrame.labeledThing.color,
        true
      );
    });
  }
}

export default LineDrawingTool;

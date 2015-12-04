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
   */
  constructor(drawingContext, options, entityIdService) {
    super(drawingContext, options, entityIdService);
    this._startPoint = null;
  }

  _addPoint(event) {
    const point = event.point;
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
        [point], 'red',
        true
      );
    });
  }
}

export default LineDrawingTool;

import PathDrawingTool from './PathDrawingTool';
import PaperPolygon from '../Shapes/PaperPolygon';

/**
 * A tool for drawing a path with the mouse cursor
 *
 * @extends PathDrawingTool
 */
export default class PolygonDrawingTool extends PathDrawingTool {
  _draw(point) {
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._path = new PaperPolygon(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        [point],
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });
  }
}

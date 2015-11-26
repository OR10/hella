import PathDrawingTool from './PathDrawingTool';
import PaperPolygon from '../Shapes/PaperPolygon';
import uuid from 'uuid';

/**
 * A tool for drawing a path with the mouse cursor
 */
export default class PolygonDrawingTool extends PathDrawingTool {
  _draw(point) {
    this._context.withScope(() => {
      // TODO use entityIdService if/once we make this a directive
      this._path = new PaperPolygon(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, [point], 'red');
      this._path.select();
    });
  }
}

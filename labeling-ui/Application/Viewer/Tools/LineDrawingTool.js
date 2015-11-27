import PathDrawingTool from './PathDrawingTool';
import PaperLine from '../Shapes/PaperLine';
import uuid from 'uuid';

/**
 * A tool for drawing a path with the mouse cursor
 *
 * @class LineDrawingTool
 * @extends PathDrawingTool
 */
class LineDrawingTool extends PathDrawingTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);
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
      this.emit('shape:new', this._path);
      this._cleanUp();
    }
  }

  _draw(point) {
    this._context.withScope(() => {
      // TODO use entityIdService if/once we make this a directive
      this._path = new PaperLine(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, [point], 'red');
    });
  }
}

export default LineDrawingTool;

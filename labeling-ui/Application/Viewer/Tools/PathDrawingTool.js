import paper from 'paper';
import DrawingTool from './DrawingTool';
import PaperPath from '../Shapes/PaperPath';

/**
 * A tool for drawing a path with the mouse cursor
 *
 * @extends DrawingTool
 */
class PathDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, options) {
    super($scope, drawingContext, entityIdService, options);

    this._path = null;

    this._tool.onMouseUp = this._addPoint.bind(this);
  }

  _addPoint(event) {
    const point = event.point;
    const drawingOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
    };

    if (event.event.altKey) {
      // Ensure the parent/child structure is intact
      const labeledThingInFrame = this._path.labeledThingInFrame;
      labeledThingInFrame.shapes.push(this._path.toJSON());

      this.emit('shape:new', this._path);
      return;
    }

    if (!this._path) {
      this._draw(point, drawingOptions);
      this.emit('path:new', this._path);
    } else {
      this._path.add(new paper.Point(event.event.offsetX, event.event.offsetY));
      this.emit('path:update', this._path);
    }
  }

  _draw(point) {
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._path = new PaperPath(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        [point], 'red',
        true
      );
    });
  }
}

export default PathDrawingTool;

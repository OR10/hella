import paper from 'paper';
import Tool from './Tool';
import PaperPath from '../Shapes/PaperPath';
import uuid from 'uuid';

/**
 * A tool for drawing a path with the mouse cursor
 *
 * @class PathDrawingTool
 * @extends Tool
 */
class PathDrawingTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);

    this._$scope = $scope;

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
    this._context.withScope(() => {
      // TODO use entityIdService if/once we make this a directive
      this._path = new PaperPath(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, [point], 'red');
    });
  }

  _cleanUp() {
    this._path = null;
  }
}

export default PathDrawingTool;

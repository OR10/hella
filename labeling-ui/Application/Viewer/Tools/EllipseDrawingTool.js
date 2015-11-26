import paper from 'paper';
import Tool from './Tool';
import PaperEllipse from '../Shapes/PaperEllipse';
import uuid from 'uuid';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @class EllipseDrawingTool
 * @extends Tool
 */
class EllipseDrawingTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);

    this._$scope = $scope;

    this._startPosition = null;

    this._tool.onMouseDown = this._startNewEllipse.bind(this);
    this._tool.onMouseDrag = this._updateEllipse.bind(this);
    this._tool.onMouseUp = this._completeEllipse.bind(this);
  }

  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const size = new paper.Point(1, 1);

    this._context.withScope(() => {
      // TODO use entityIdService if/once we make this a directive
      this._shape = new PaperEllipse(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, this._startPosition, size, 'red');
      this._shape.select();
    });

    this.emit('ellipse:new', this._shape);
  }

  _updateEllipse(event) {
    const point = event.point;

    const width = Math.abs(point.x - this._startPosition.x) || 1;
    const height = Math.abs(point.y - this._startPosition.y) || 1;

    const scaleX = width / this._shape.bounds.width || 1;
    const scaleY = height / this._shape.bounds.height || 1;

    this._shape.scale(scaleX, scaleY, this._getScaleAnchor(point));

    this.emit('ellipse:update', this._shape);
  }

  _completeEllipse() {
    this.emit('ellipse:complete', this._shape);
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return this._shape.bounds.topLeft;
    }

    if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return this._shape.bounds.topRight;
    }

    if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return this._shape.bounds.bottomRight;
    }

    return this._shape.bounds.bottomLeft;
  }
}

export default EllipseDrawingTool;

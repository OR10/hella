import paper from 'paper';
import Tool from './Tool';
import PaperRectangle from '../Shapes/PaperRectangle';
import uuid from 'uuid';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @class RectangleDrawingTool
 * @extends Tool
 */
class RectangleDrawingTool extends Tool {
  /**
   * @param $scope
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);

    this._$scope = $scope;

    this._rect = null;
    this._startPosition = null;

    this._tool.onMouseDown = this._startNewRect.bind(this);
    this._tool.onMouseDrag = this._updateRect.bind(this);
    this._tool.onMouseUp = this._completeRect.bind(this);
  }

  _startNewRect(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point rectangles so we cheat a little on the first draw
    const endPosition = new paper.Point(
      this._startPosition.x + 1,
      this._startPosition.y + 1
    );

    this._context.withScope(() => {
      // TODO use entityIdService if/once we make this a directive
      this._rect = new PaperRectangle(uuid.v4(), this._$scope.vm.selectedLabeledThingInFrame.id, this._startPosition, endPosition, 'red');
    });

    this.emit('rectangle:new', this._rect);
  }

  _updateRect(event) {
    const point = event.point;

    const width = Math.abs(point.x - this._startPosition.x) || 1;
    const height = Math.abs(point.y - this._startPosition.y) || 1;

    const scaleX = width / this._rect.bounds.width || 1;
    const scaleY = height / this._rect.bounds.height || 1;

    this._rect.scale(scaleX, scaleY, this._getScaleAnchor(point));

    this.emit('rectangle:update', this._rect);
  }

  _completeRect() {
    this.emit('shape:new', this._rect);
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topLeft;
    }

    if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return this._rect.bounds.topRight;
    }

    if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return this._rect.bounds.bottomRight;
    }

    return this._rect.bounds.bottomLeft;
  }
}

export default RectangleDrawingTool;

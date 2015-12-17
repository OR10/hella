import paper from 'paper';
import DrawingTool from './DrawingTool';
import PaperRectangle from '../Shapes/PaperRectangle';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class RectangleDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    super($scope, drawingContext, entityIdService, entityColorService, options);

    this._rect = null;
    this._startPosition = null;
  }

  onMouseDown(event) {
    this._$scope.$apply(
      () => this._startPosition = event.point
    );
  }

  onMouseDrag(event) {
    const point = event.point;

    if (this._rect) {
      this._$scope.$apply(
        () => this.updateShape(event.point)
      );
    } else if (this._startPosition.getDistance(point) > 5) {
      const labeledThingInFrame = this._createLabeledThingHierarchy();

      const endPoint = new paper.Point(
        Math.abs(this._startPosition.x - point.x) === 0 ? point.x + 1 : point.x,
        Math.abs(this._startPosition.y - point.y) === 0 ? point.y + 1 : point.y
      );

      this._context.withScope(() => {
        this._rect = new PaperRectangle(
          labeledThingInFrame,
          this._entityIdService.getUniqueId(),
          this._startPosition,
          endPoint,
          labeledThingInFrame.labeledThing.color,
          true
        );
      });

      this.emit('rectangle:new', this._rect);
    }
  }

  updateShape(point) {
    const width = Math.abs(point.x - this._startPosition.x) || 1;
    const height = Math.abs(point.y - this._startPosition.y) || 1;

    const scaleX = width / this._rect.bounds.width || 1;
    const scaleY = height / this._rect.bounds.height || 1;

    this._rect.scale(scaleX, scaleY, this._getScaleAnchor(point));

    this.emit('rectangle:update', this._rect);
  }

  onMouseUp() {
    if (this._rect) {
      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._rect.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._rect.toJSON());

    this.emit('shape:new', this._rect);
    this._rect = null;
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

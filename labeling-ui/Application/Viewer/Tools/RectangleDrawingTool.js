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
      () => this.startShape(event.point)
    );
  }

  startShape(point) {
    this._startPosition = point;

    // PaperJs doesn't deal well with single point rectangles so we cheat a little on the first draw
    const endPosition = new paper.Point(
      this._startPosition.x + 1,
      this._startPosition.y + 1
    );

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        this._startPosition,
        endPosition,
        labeledThingInFrame.labeledThing.color,
        true
      );
    });

    this.emit('rectangle:new', this._rect);
  }

  onMouseDrag(event) {
    this._$scope.$apply(
      () => this.updateShape(event.point)
    );
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
    this._$scope.$apply(
      () => this.completeShape()
    );
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._rect.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._rect.toJSON());

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

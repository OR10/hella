import paper from 'paper';
import DrawingTool from './DrawingTool';
import PaperCenterLine from '../Shapes/PaperCenterLine';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class CenterLineRectangleDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    super($scope, drawingContext, entityIdService, entityColorService, options);

    this._line = null;
    this._startPosition = null;
  }

  startShape(from, to) {
    console.log('start shape');
    if (from.getDistance(to) > 5) {
      const labeledThingInFrame = this._createLabeledThingHierarchy();

      const endPoint = new paper.Point(
        to.x,
        Math.abs(from.y - to.y) === 0 ? to.y + 1 : to.y
      );

      this._context.withScope(() => {
        this._line = new PaperCenterLine(
          labeledThingInFrame,
          this._entityIdService.getUniqueId(),
          from,
          endPoint,
          this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
          true
        );
      });

      console.log('line', this._line);

      this.emit('shape:new', this._line);
    }
  }

  onMouseDown(event) {
    this._startPosition = event.point;
  }

  onMouseDrag(event) {
    if (this._line) {
      this._$scope.$apply(
        () => this.updateShape(event.point)
      );
    } else {
      this._$scope.$apply(
        () => this.startShape(this._startPosition, event.point)
      );
    }
  }

  updateShape(point) {
    const height = Math.abs(point.y - this._startPosition.y) || 1;
    const scaleY = height / this._line.bounds.height || 1;

    this._line.scale(0, scaleY, this._startPosition);

    console.log('shape:update');

    this.emit('shape:update', this._line);
  }

  onMouseUp() {
    if (this._line) {
      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._line.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._line.toJSON());

    console.log('shape:complete');

    this.emit('shape:new', this._line);
    this._line = null;
  }
}

export default CenterLineRectangleDrawingTool;

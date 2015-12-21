import paper from 'paper';
import EllipseDrawingTool from './EllipseDrawingTool';
import PaperCircle from '../Shapes/PaperCircle';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @extends EllipseDrawingTool
 */
class CircleDrawingTool extends EllipseDrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    super($scope, drawingContext, entityIdService, entityColorService, options);
  }

  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const radius = 1;

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._shape = new PaperCircle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        this._startPosition,
        radius,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    this.emit('circle:new', this._shape);
  }

  _updateEllipse(event) {
    const point = event.point;
    const distance = this._startPosition.getDistance(point);
    const scale = distance / this._shape.bounds.width || 1;

    this._shape.scale(scale);
    this._shape.moveTo(new paper.Point((this._startPosition.x + point.x) / 2, (this._startPosition.y + point.y) / 2));

    this.emit('circle:update', this._shape);
  }
}

export default CircleDrawingTool;

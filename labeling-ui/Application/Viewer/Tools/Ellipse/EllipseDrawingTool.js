import paper from 'paper';
import DrawingTool from '../DrawingTool';
import PaperEllipse from '../../Shapes/PaperEllipse';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @extends DrawingTool
 */
class EllipseDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    super($scope, drawingContext, entityIdService, entityColorService, options);

    this._startPosition = null;

    this._tool.onMouseDown = this._startNewEllipse.bind(this);
    this._tool.onMouseDrag = this._updateEllipse.bind(this);
    this._tool.onMouseUp = this._completeEllipse.bind(this);
  }

  _startNewEllipse(event) {
    this._startPosition = event.point;

    // PaperJs doesn't deal well with single point ellipses so we cheat a little on the first draw
    const size = new paper.Point(1, 1);

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._shape = new PaperEllipse(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        this._startPosition,
        size,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
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
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._shape.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._shape.toJSON());

    this.emit('shape:new', this._shape);
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

import paper from 'paper';
import DrawingTool from '../DrawingTool';
import PaperRectangle from '../../Shapes/PaperRectangle';
import Handle from '../../Shapes/Handles/Handle';

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
   * @param {Video} video
   * @param {Task} task
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, video, task) {
    super($scope, drawingContext, entityIdService, entityColorService, video, task);

    /**
     * @type {PaperRectangle}
     * @private
     */
    this._rect = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._startPosition = null;
  }

  startShape(from, to) {
    if (from.getDistance(to) < 5) {
      // Do nothing if no "real" dragging operation took place.
      return;
    }
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    const endPoint = new paper.Point(
      Math.abs(from.x - to.x) === 0 ? to.x + 1 : to.x,
      Math.abs(from.y - to.y) === 0 ? to.y + 1 : to.y
    );

    this._context.withScope(() => {
      this._rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        endPoint,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });
  }

  onMouseDown(event) {
    this._startPosition = event.point;
  }

  onMouseDrag(event) {
    const point = event.point;
    if (this._rect) {
      this._$scope.$apply(
        () => {
          this._rect.resize(this._getScaleAnchor(point), point);
        }
      );
    } else {
      this._$scope.$apply(
        () => this.startShape(this._startPosition, point)
      );
    }
  }

  onMouseUp() {
    this.emit('tool:finished');
    if (this._rect) {
      // Fix bottom-right and top-left orientation
      this._rect.fixOrientation();

      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._rect.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._rect.toJSON());

    this.emit('shape:create', this._rect);
    this._rect = null;
  }

  _getScaleAnchor(point) {
    if (point.x > this._startPosition.x && point.y > this._startPosition.y) {
      return new Handle('bottom-right', point);
    }

    if (point.x <= this._startPosition.x && point.y > this._startPosition.y) {
      return new Handle('bottom-left', point);
    }

    if (point.x <= this._startPosition.x && point.y <= this._startPosition.y) {
      return new Handle('top-left', point);
    }

    return new Handle('top-right', point);
  }

  createNewDefaultShape() {
    const width = 100;
    const height = 100;
    const from = new paper.Point(
      (this.video.metaData.width / 2) - (width / 2),
      (this.video.metaData.height / 2) - (height / 2)
    );
    const to = new paper.Point(
      (this.video.metaData.width / 2) + (width / 2),
      (this.video.metaData.height / 2) + (height / 2)
    );
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        to,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this.completeShape();
  }
}

export default RectangleDrawingTool;

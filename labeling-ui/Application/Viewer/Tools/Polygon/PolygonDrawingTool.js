import paper from 'paper';
import DrawingTool from '../DrawingTool';
import PaperPolygon from '../../Shapes/PaperPolygon';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class PolygonDrawingTool extends DrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Video} video
   * @param {Task} task
   */
  constructor($scope, drawingContext, loggerService, entityIdService, entityColorService, video, task) {
    super($scope, drawingContext, loggerService, entityIdService, entityColorService, video, task);

    /**
     * @type {PaperPolygon}
     * @private
     */
    this._polygon = null;

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

    this._context.withScope(() => {
      this._polygon = new PaperPolygon(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        [from, to],
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });
  }

  _cleanUp() {
    if (this._polygon) {
      this._polygon.remove();
      this._polygon = null;
    }
    this._startPosition = null;
  }

  onMouseDown(event) {
    const point = event.point;
    const {minHandles, maxHandles} = this._getHandleCountRestrictions();

    if (this._startPosition && event.event.button === 2) {
      if (this._polygon && this._polygon.points.length < minHandles) {
        this._cleanUp();
        this.emit('tool:finished');
        this._$scope.$emit('drawingtool:exception', `To few points! You need to set at least ${minHandles} points to create this shape.`);
        return;
      }
      this.completeShape();
      this.emit('tool:finished');
      this._cleanUp();
      return;
    }

    if (this._polygon && this._polygon.points.length > maxHandles) {
      this._$scope.$emit('drawingtool:exception', `To many points! You are only allowed to create up to ${maxHandles} points in this shape. The shape create process was finished and the shape is created!`);
      this.completeShape();
      this.emit('tool:finished');
      this._cleanUp();
      return;
    }

    if (this._polygon) {
      this._polygon.addPoint(point);
      return;
    }

    this._startPosition = point;
    this.emit('tool:finished');
  }

  _getHandleCountRestrictions() {
    const drawingToolOptions = this._options.polygon;
    const minHandles = (drawingToolOptions && drawingToolOptions.minHandles)
      ? drawingToolOptions.minHandles
      : 3;
    const maxHandles = (drawingToolOptions && drawingToolOptions.maxHandles)
      ? drawingToolOptions.maxHandles
      : 15;

    return {minHandles, maxHandles};
  }

  onMouseDrag(event) {
    const point = event.point;

    if (this._polygon) {
      this._$scope.$apply(
        () => {
          this._polygon.setSecondPoint(point);
        }
      );
    } else {
      this._$scope.$apply(
        () => this.startShape(this._startPosition, point)
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._polygon.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._polygon.toJSON());

    this.emit('shape:create', this._polygon);
    this._polygon = null;
    this._startPosition = null;
  }

  createNewDefaultShape() {
    const center = new paper.Point(
      this.video.metaData.width / 2,
      this.video.metaData.height / 2
    );

    const points = [
      new paper.Point(center.x + 50, center.y),
      new paper.Point(center.x, center.y + 50),
      new paper.Point(center.x - 50, center.y),
      new paper.Point(center.x, center.y - 50),
    ];
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._polygon = new PaperPolygon(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        points,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this.completeShape();
  }
}

export default PolygonDrawingTool;

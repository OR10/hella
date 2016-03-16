import paper from 'paper';
import DrawingTool from './DrawingTool';
import PaperPedestrian from '../Shapes/PaperPedestrian';

/**
 * A tool for drawing pedestrian shapes with the mouse cursor
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

    /**
     * @type {PaperPedestrian|null}
     * @private
     */
    this._pedestrian = null;

    /**
     * @type {paper.Point|null}
     * @private
     */
    this._startPoint = null;
  }

  /**
   * Start the initial drawing of a pedestrian
   *
   * @param {paper.Point} from
   * @param {paper.Point} to
   */
  startShape(from, to) {
    if (Math.abs(from.y - to.y) < 5) {
      // Do nothing if no "real" dragging operation took place.
      return;
    }

    const labeledThingInFrame = this._createLabeledThingHierarchy();

    let topCenter, bottomCenter;
    if (from.y < to.y) {
      topCenter = new paper.Point(from.x, from.y);
      bottomCenter = new paper.Point(from.x, to.y);
    } else {
      topCenter = new paper.Point(from.x, to.y);
      bottomCenter = new paper.Point(from.x, from.y);
    }

    this._context.withScope(() => {
      this._pedestrian = new PaperPedestrian(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        topCenter,
        bottomCenter,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    this.emit('pedestrian:new', this._rect);
  }

  /**
   * Update an already created shape during intial drawing
   *
   * @param {paper.Point} point
   */
  updateShape(point) {
    const {topCenter, bottomCenter} = this._pedestrian.getCenterPoints();
    let anchorPoint;

    if (this._startPoint.getDistance(topCenter) <= 4) {
      // TopCenter handle clicked
      if (point.y < bottomCenter.y) {
        // Top of bottom handle
        anchorPoint = bottomCenter;
      } else {
        // Bottom of bottom handle
        // Handle flip!
        anchorPoint = topCenter;
      }
    } else {
      // BottomCenter handle clicked
      if (point.y > topCenter.y) {
        // Bottom of top handle
        anchorPoint = topCenter;
      } else {
        // Top of top handle
        // Handle flip!
        anchorPoint = bottomCenter;
      }
    }

    const scaleFactor = Math.abs(anchorPoint.y - point.y) / Math.abs(bottomCenter.y - topCenter.y);
    this._pedestrian.scale(1, scaleFactor, anchorPoint);
    this.emit('rectangle:update', this._pedestrian);
  }

  /**
   * Finish the drawing operation by emitting the new shape
   */
  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._pedestrian.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._pedestrian.toJSON());

    this.emit('shape:new', this._pedestrian);
    this._pedestrian = null;
  }

  /**
   * Handle mousedown events
   *
   * @param event
   */
  onMouseDown(event) {
    this._startPoint = event.point;
  }

  /**
   * Handle mousedrag events
   *
   * @param event
   */
  onMouseDrag(event) {
    if (this._pedestrian) {
      this._$scope.$apply(
        () => this.updateShape(event.point)
      );
    } else {
      this._$scope.$apply(
        () => this.startShape(this._startPoint, event.point)
      );
    }
  }

  /**
   * Handle mouseup events
   *
   * @param event
   */
  onMouseUp(event) {
    if (this._pedestrian) {
      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }
}

export default RectangleDrawingTool;

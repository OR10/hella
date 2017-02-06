import paper from 'paper';
import DrawingTool from '../DrawingTool';
import PaperPedestrian from '../../Shapes/PaperPedestrian';
import Handle from '../../Shapes/Handles/Handle';

/**
 * A tool for drawing pedestrian shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class PedestrianDrawingTool extends DrawingTool {
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
     * @type {PaperPedestrian|null}
     * @private
     */
    this._pedestrian = null;

    /**
     * @type {Point|null}
     * @private
     */
    this._startPosition = null;

    /**
     * @type {Handle|null}
     * @private
     */
    this._creationHandle = null;
  }

  /**
   * Start the initial drawing of a pedestrian
   *
   * @param {Point} from
   * @param {Point} to
   */
  startShape(from, to) {
    if (from.getDistance(to) < 5) {
      // Do nothing if no "real" dragging operation took place.
      return;
    }
    const labeledThingInFrame = this._createLabeledThingHierarchy();
    let topCenter;
    let bottomCenter;

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
      this._creationHandle = this._getScaleAnchor(to);
      this._pedestrian.resize(this._creationHandle, to, this._getMinimalHeight());
    });
  }

  /**
   * Handle mousedown events
   *
   * @param event
   */
  onMouseDown(event) {
    this._startPosition = event.point;
  }

  /**
   * Handle mousedrag events
   *
   * @param event
   */
  onMouseDrag(event) {
    const point = event.point;

    if (this._pedestrian) {
      this._$scope.$apply(
        () => {
          this._pedestrian.resize(this._creationHandle, point, this._getMinimalHeight());
        }
      );
    } else {
      this._$scope.$apply(
        () => this.startShape(this._startPosition, point)
      );
    }
  }

  /**
   * Handle mouse up events
   *
   * @param event
   */
  onMouseUp(event) { // eslint-disable-line no-unused-vars
    this.emit('tool:finished');
    if (this._pedestrian) {
      // Fix point orientation of top and bottom center
      this._pedestrian.fixOrientation();

      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._pedestrian.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._pedestrian.toJSON());

    this.emit('shape:create', this._pedestrian);

    this._pedestrian = null;
  }

  _getScaleAnchor(point) {
    if (point.y > this._startPosition.y) {
      return new Handle('bottom-center', new paper.Point(this._startPosition.x, point.y));
    }
    return new Handle('top-center', new paper.Point(this._startPosition.x, point.y));
  }

  _getMinimalHeight() {
    const drawingToolOptions = this._options.pedestrian;
    return (drawingToolOptions && drawingToolOptions.minimalHeight && drawingToolOptions.minimalHeight > 0)
      ? drawingToolOptions.minimalHeight
      : 1;
  }

  createNewDefaultShape() {
    const height = 100;
    const from = new paper.Point(
      this.video.metaData.width / 2,
      (this.video.metaData.height / 2) - (height / 2)
    );
    const to = new paper.Point(
      this.video.metaData.width / 2,
      (this.video.metaData.height / 2) + (height / 2)
    );
    const labeledThingInFrame = this._createLabeledThingHierarchy();

    this._context.withScope(() => {
      this._pedestrian = new PaperPedestrian(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        to,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    this.completeShape();
  }
}

export default PedestrianDrawingTool;

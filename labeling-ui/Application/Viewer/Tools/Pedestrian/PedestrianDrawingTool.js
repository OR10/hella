import paper from 'paper';
import DrawingTool from '../DrawingTool';
import PaperPedestrian from '../../Shapes/PaperPedestrian';

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
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, entityColorService, options) {
    const defaultOptions = {
      minimalHeight: 1,
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    super($scope, drawingContext, entityIdService, entityColorService, mergedOptions);

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
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this.emit('pedestrian:new', this._pedestrian);
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
          this._pedestrian.resize(this._getScaleAnchor(point), point);
          this.emit('pedestrian:update', this._pedestrian);
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
    if (this._pedestrian) {
      this._$scope.$apply(
        () => this.completeShape()
      );
    }
  }

  completeShape() {
    // Ensure the parent/child structure is intact
    const labeledThingInFrame = this._pedestrian.labeledThingInFrame;
    labeledThingInFrame.shapes.push(this._pedestrian.toJSON());

    this.emit('shape:new', this._pedestrian);
    this._pedestrian = null;
  }

  _getScaleAnchor(point) {
    if (point.y > this._startPosition.y) {
      return 'bottom-center';
    }
    return 'top-center';
  }
}

export default PedestrianDrawingTool;

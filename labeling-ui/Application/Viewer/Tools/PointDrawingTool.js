import CircleDrawingTool from './CircleDrawingTool';
import PaperCircle from '../Shapes/PaperCircle';
import uuid from 'uuid';

/**
 * A tool for drawing ellipse shapes with the mouse cursor
 *
 * @extends CircleDrawingTool
 */
class PointDrawingTool extends CircleDrawingTool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContext} drawingContext
   * @param {EntityIdService} entityIdService
   * @param {Object?} options
   */
  constructor($scope, drawingContext, entityIdService, options) {
    super($scope, drawingContext, entityIdService, options);
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
        this._startPosition, radius, 'red',
        true
      );
    });

    this.emit('point:new', this._shape);
  }

  _updateEllipse() {
    // Nothing to update!
  }

}

export default PointDrawingTool;

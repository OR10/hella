import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperRectangle from '../../Shapes/PaperRectangle';
import Handle from '../../Shapes/Handles/Handle';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class RectangleDrawingTool extends CreationTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $scope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(drawingContext, $scope, $q, loggerService, entityIdService, entityColorService) {
    super(drawingContext, $scope, $q, loggerService, entityIdService, entityColorService);
  }

  onMouseDown(event) {
    this._startPosition = event.point;
  }

  onMouseDrag(event) {
    const point = event.point;

    if (this._rect) {
      this._$scope.$apply(
        () => {
          this._rect.resize(this._creationHandle, point, {width: 1, height: this._getMinimalHeight()});
        }
      );
    } else {
      this._$scope.$apply(
        () => this._startShape(this._startPosition, point)
      );
    }
  }

  onMouseUp() {
    if (this._rect) {
      // Fix bottom-right and top-left orientation
      this._rect.fixOrientation();

      this._rect.remove();
      this._complete(this._rect);
    }
  }

  /**
   * @param toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._rect = null;
    this._startPosition = null;
    this._creationHandle = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  _startShape(from, to) {
    if (from.getDistance(to) < 5) {
      // Do nothing if no "real" dragging operation took place.
      return;
    }
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    this._context.withScope(() => {
      this._rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        from,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
      this._creationHandle = this._getScaleAnchor(from);
      this._rect.resize(this._creationHandle, to, {width: 1, height: this._getMinimalHeight()});
    });
  }

  /**
   * @return {number}
   * @private
   */
  _getMinimalHeight() {
    const {minimalHeight} = this._toolActionStruct;

    return minimalHeight && minimalHeight > 0 ? minimalHeight : 1;
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

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;

    const width = 100;
    const height = 100;
    const from = new paper.Point(
      (video.metaData.width / 2) - (width / 2),
      (video.metaData.height / 2) - (height / 2)
    );
    const to = new paper.Point(
      (video.metaData.width / 2) + (width / 2),
      (video.metaData.height / 2) + (height / 2)
    );
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    let rect;
    this._context.withScope(() => {
      rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        to,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
    });

    this._complete(rect);
  }
}

RectangleDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
];

export default RectangleDrawingTool;

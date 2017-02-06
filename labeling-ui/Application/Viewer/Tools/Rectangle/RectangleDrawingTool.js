import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperRectangle from '../../Shapes/PaperRectangle';
import Handle from '../../Shapes/Handles/Handle';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class RectangleDrawingTool extends CreationTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService) {
    super(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService);

    /**
     * @type {PaperRectangle|null}
     * @private
     */
    this._rect = null;

    /**
     * @type {paper.Point|null}
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
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    this._startPosition = event.point;
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;

    if (this._rect) {
      this._rect.resize(this._creationHandle, point, {width: 1, height: this._getMinimalHeight()});
    } else {
      this._startShape(this._startPosition, point);
    }
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    if (this._rect === null) {
      this._reject(new NotModifiedError('No Rectangle was created/dragged.'));
      return;
    }

    // Fix bottom-right and top-left orientation
    this._rect.fixOrientation();

    this._rect.remove();
    this._complete(this._rect);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._rect = null;
    this._startPosition = null;
    this._creationHandle = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  _startShape(from, to) {
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    this._context.withScope(() => {
      this._rect = new PaperRectangle(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        from,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
      this._creationHandle = this._getScaleAnchor(from);
      this._rect.resize(this._creationHandle, to, {width: 1, height: this._getMinimalHeight()});
    });
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
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    this._complete(rect);
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    if (this._rect !== null) {
      this._rect.remove();
    }

    return super.abort();
  }

  /**
   * @return {number}
   * @private
   */
  _getMinimalHeight() {
    const {minimalHeight} = this._toolActionStruct.options;
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

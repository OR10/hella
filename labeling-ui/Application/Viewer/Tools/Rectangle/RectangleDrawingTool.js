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
   * @param {HierarchyCreationService} hierarchyCreationService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService, hierarchyCreationService) {
    super(drawingContext, $rootScope, $q, loggerService, hierarchyCreationService);

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;

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
  onMouseUp() {
    if (this._rect === null) {
      this._reject(new NotModifiedError('No Rectangle was created/dragged.'));
      return;
    }

    // Fix bottom-right and top-left orientation
    this._rect.fixOrientation();

    this._complete(this._rect);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise.<PaperShape>}
   */
  invokeShapeCreation(toolActionStruct) {
    this._rect = null;
    this._startPosition = null;
    this._creationHandle = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  _startShape(from, to) {
    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

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
   * @return {Promise.<PaperShape>}
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;

    const width = 100;
    const height = 100;
    const rectangleDivider = 2;
    const from = new paper.Point(
      (video.metaData.width / rectangleDivider) - (width / rectangleDivider),
      (video.metaData.height / rectangleDivider) - (height / rectangleDivider)
    );
    const to = new paper.Point(
      (video.metaData.width / rectangleDivider) + (width / rectangleDivider),
      (video.metaData.height / rectangleDivider) + (height / rectangleDivider)
    );
    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

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

    return this._complete(rect);
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

/**
 * Return the name of the tool. The name needs to be unique within the application.
 * Therefore something like a prefix followed by the className is advisable.
 *
 * @return {string}
 * @public
 * @abstract
 * @static
 */
RectangleDrawingTool.getToolName = () => {
  return 'RectangleDrawingTool';
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
RectangleDrawingTool.isShapeClassSupported = shapeClass => {
  return [
    'rectangle',
  ].includes(shapeClass);
};

/**
 * Check if the given actionIdentifer is supported by this tool.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
RectangleDrawingTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'creation',
  ].includes(actionIdentifier);
};

RectangleDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
  'hierarchyCreationService',
];

export default RectangleDrawingTool;

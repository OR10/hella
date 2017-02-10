import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperPolygon from '../../Shapes/PaperPolygon';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */
class PolygonDrawingTool extends CreationTool {
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
     * @type {PaperPolygon}
     * @private
     */
    this._polygon = null;

    /**
     * @type {paper.Point|null}
     * @private
     */
    this._startPosition = null;
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._polygon = null;
    this._startPosition = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise.<PaperShape>}
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    const promise = super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;

    const center = new paper.Point(
      video.metaData.width / 2,
      video.metaData.height / 2
    );

    const points = [
      new paper.Point(center.x + 50, center.y),
      new paper.Point(center.x, center.y + 50),
      new paper.Point(center.x - 50, center.y),
      new paper.Point(center.x, center.y - 50),
    ];
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    let polygon = null;
    this._context.withScope(() => {
      polygon = new PaperPolygon(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        points,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
      polygon.remove();
    });

    return this._complete(polygon);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    const point = event.point;
    const {minHandles, maxHandles} = this._getHandleCountRestrictions();

    if (this._startPosition && event.event.button === 2) {
      if (this._polygon && this._polygon.points.length < minHandles) {
        this._polygon.remove();
        this._$rootScope.$emit('drawingtool:exception', `To few points! You need to set at least ${minHandles} points to create this shape.`);
        return;
      }
      this._polygon.remove();
      this._complete(this._polygon);
      return;
    }

    if (this._polygon && this._polygon.points.length > maxHandles) {
      this._$rootScope.$emit('drawingtool:exception', `To many points! You are only allowed to create up to ${maxHandles} points in this shape. The shape create process was finished and the shape is created!`);
      this._polygon.remove();
      this._complete(this._polygon);
      return;
    }

    if (this._polygon) {
      this._polygon.addPoint(point);
      return;
    }

    this._startPosition = point;
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;

    if (this._polygon) {
      this._polygon.setSecondPoint(point);
    } else {
      this._startShape(this._startPosition, point)
    }
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    // Polygon wasn't created. It was only clicked to the canvas.
    if (this._polygon === null) {
      this._reject(new NotModifiedError('No Polygon was created/dragged.'));
    }
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    if (this._polygon !== null) {
      this._polygon.remove();
    }

    return super.abort();
  }


  /**
   * @param {paper.Point} from
   * @param {paper.Point} to
   * @private
   */
  _startShape(from, to) {
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

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

  /**
   * @returns {{minHandles: number, maxHandles: number}}
   * @private
   */
  _getHandleCountRestrictions() {
    let {minHandles, maxHandles} = this._toolActionStruct.options;
    minHandles = minHandles !== undefined ? minHandles : 3;
    maxHandles = maxHandles !== undefined ? maxHandles : 15;

    return {minHandles, maxHandles};
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
PolygonDrawingTool.getToolName = function () {
  return 'PedestrianDrawingTool';
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
PolygonDrawingTool.isShapeClassSupported = function (shapeClass) {
  return [
    'polygon',
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
PolygonDrawingTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'creation',
  ].includes(actionIdentifier);
};

PolygonDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
];

export default PolygonDrawingTool;

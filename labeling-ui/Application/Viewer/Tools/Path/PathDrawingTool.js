import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperPolygon from '../../Shapes/PaperPolygon';
import PaperPolyline from '../../Shapes/PaperPolyline';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A tool for drawing rectangle shapes with the mouse cursor
 *
 * @extends DrawingTool
 * @implements ToolEvents
 */

class PathDrawingTool extends CreationTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   * @param {HierarchyCreationService} hierarchyCreationService
   * @param {string} pathIdentifier
   * @param {DrawClassShapeService} drawClassShapeService
   * @param {LabelStructureService} labelStructureService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, entityIdService, entityColorService, hierarchyCreationService, pathIdentifier, drawClassShapeService, labelStructureService) {
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
     * @type {PaperPolygon}
     * @private
     */
    this._path = null;

    /**
     * @type {paper.Point|null}
     * @private
     */
    this._startPosition = null;

    /**
     * @type {bool}
     * @private
     */
    this._inProgress = false;

    /**
     * @type {string}
     * @private
     */
    this._pathIdentifier = pathIdentifier;

    /**
     * @type {DrawClassShapeService}
     * @private
     */
    this._drawClassShapeService = drawClassShapeService;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._path = null;
    this._startPosition = null;
    this._inProgress = false;

    return super.invokeShapeCreation(toolActionStruct);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise.<PaperShape>}
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;

    const center = new paper.Point(
      video.metaData.width / 2,
      video.metaData.height / 2
    );
    const arbitrarySpace = 50;
    const points = [
      new paper.Point(center.x + arbitrarySpace, center.y),
      new paper.Point(center.x, center.y + arbitrarySpace),
      new paper.Point(center.x - arbitrarySpace, center.y),
      new paper.Point(center.x, center.y - arbitrarySpace),
    ];
    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

    let shape;
    this._context.withScope(() => {
      switch (this._pathIdentifier) {
        case PaperPolygon.getClass():
          shape = new PaperPolygon(
            labeledThingInFrame,
            this._entityIdService.getUniqueId(),
            points,
            this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor)
          );
          break;

        case PaperPolyline.getClass():
          shape = new PaperPolyline(
            labeledThingInFrame,
            this._entityIdService.getUniqueId(),
            points,
            this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
            this._drawClassShapeService,
            this._labelStructureService,
            this._context
          );
          break;

        default:
          throw new Error(`Unknown path identifier "${this._pathIdentifier}"`);
      }
    });

    return this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    const point = event.point;
    const minHandles = this._getMinHandleCountRestriction();
    const rightMouseDown = 2;
    if (this._startPosition && event.event.button === rightMouseDown) {
      if (this._path && this._path.points.length < minHandles) {
        this._path.remove();
        this._reject(new NotModifiedError(`To few points! You need to set at least ${minHandles} points to create this shape.`));
        return;
      }
      this._complete(this._path);
      return;
    }

    if (this._path) {
      this._path.addPoint(point);
      return;
    }

    this._startPosition = point;
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    // Abort drag handling if shape drawing is in progress
    if (this._inProgress) {
      return;
    }
    const point = event.point;

    if (this._path) {
      this._path.setSecondPoint(point);
    } else {
      this._startShape(this._startPosition, point);
    }
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp() {
    if (this._path === null) {
      this._reject(new NotModifiedError('No Path was created/dragged.'));
      return;
    }
    this._inProgress = true;
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    if (this._path !== null) {
      this._path.remove();
    }

    return super.abort();
  }


  /**
   * @param {paper.Point} from
   * @param {paper.Point} to
   * @private
   */
  _startShape(from, to) {
    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

    this._context.withScope(() => {
      switch (this._pathIdentifier) {
        case PaperPolygon.getClass():
          this._path = new PaperPolygon(
            labeledThingInFrame,
            this._entityIdService.getUniqueId(),
            [from, to],
            this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor)
          );
          break;
        case PaperPolyline.getClass():
          this._path = new PaperPolyline(
            labeledThingInFrame,
            this._entityIdService.getUniqueId(),
            [from, to],
            this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
            this._drawClassShapeService,
            this._labelStructureService,
            this._context
          );
          break;
        default:
          throw new Error(`Unknown path identifier "${this._pathIdentifier}"`);
      }
    });
  }

  /**
   * @returns integer
   * @private
   */
  _getMinHandleCountRestriction() {
    let {minHandles} = this._toolActionStruct.options;
    switch (this._pathIdentifier) {
      case PaperPolygon.getClass():
        minHandles = minHandles !== undefined ? minHandles : 3;
        break;
      case PaperPolyline.getClass():
        minHandles = minHandles !== undefined ? minHandles : 2;
        break;
      default:
        throw new Error(`Unknown path identifier "${this._pathIdentifier}"`);
    }

    return minHandles;
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
PathDrawingTool.getToolName = () => {
  return 'PathDrawingTool';
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {boolean}
 * @public
 * @abstract
 * @static
 */
PathDrawingTool.isShapeClassSupported = shapeClass => {
  return [
    'polygon',
    'polyline',
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
 * @return {boolean}
 * @public
 * @abstract
 * @static
 */
PathDrawingTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'creation',
  ].includes(actionIdentifier);
};

PathDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
  'hierarchyCreationService',
  'drawClassShapeService',
  'labelStructureService',
];

export default PathDrawingTool;

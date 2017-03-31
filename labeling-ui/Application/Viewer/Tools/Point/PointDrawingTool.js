import paper from 'paper';
import CreationTool from '../CreationTool';
import PointShape from '../../Shapes/PaperPoint';
import NotModifiedError from '../Errors/NotModifiedError';


/**
 * A tool for drawing point shapes with the mouse cursor
 *
 * @extends CreationTool
 * @implements ToolEvents
 */

class PointDrawingTool extends CreationTool {
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
     * @type {PaperPolygon}
     * @private
     */
    this._pointShape = null;

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
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._pointShape = null;
    this._startPosition = null;
    this._creationHandle = null;

    return super.invokeShapeCreation(toolActionStruct);
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise.<PaperShape>}
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    super.invokeDefaultShapeCreation(toolActionStruct);
    const {video} = toolActionStruct;

    const height = 100;
    const pedestrianDivider = 2;
    const center = new paper.Point(
        video.metaData.width / pedestrianDivider,
        (video.metaData.height / pedestrianDivider) - (height / pedestrianDivider)
    );

    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

    let pointShape = null;
    this._context.withScope(() => {
      // draw shape
      /*
       pedestrian = new PaperPedestrian(
       labeledThingInFrame,
       this._entityIdService.getUniqueId(),
       from,
       to,
       this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
       true
       );
      * */
      pointShape = new PointShape(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        center,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
    });

    return this._complete(pointShape);
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    if (this._pointShape !== null) {
      this._pointShape.remove();
    }

    return super.abort();
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

    if (this._pointShape !== null) {
      // this._pointShape.resize(this._creationHandle, point, this._getMinimalHeight());
    } else {
      this._startShape(this._startPosition, point);
    }
  }

  /**
   * Handle mouse up events
   *
   * @param event
   */
  onMouseUp(event) { // eslint-disable-line no-unused-vars
    if (this._pointShape === null) {
      this._reject(new NotModifiedError('No FixedAspectRatioRectangle was created/dragged.'));
      return;
    }
    // Fix bottom-right and top-left orientation
    this._pointShape.fixOrientation();

    this._complete(this._pointShape);
  }

  /**
   * Start the initial drawing of a pedestrian
   *
   * @param {Point} from
   * @param {Point} to
   * @private
   */
  _startShape(from, to) {
    const labeledThingInFrame = this._hierarchyCreationService.createLabeledThingInFrameWithHierarchy(this._toolActionStruct);

    this._context.withScope(() => {
      // draw shape
      this._pointShape = new PointShape(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        to,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor),
        true
      );
      // this._creationHandle = this._getScaleAnchor(to);
      // this._pedestrian.resize(this._creationHandle, to, this._getMinimalHeight());
    });
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
PointDrawingTool.getToolName = () => {
  return 'PointDrawingTool';
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
PointDrawingTool.isShapeClassSupported = shapeClass => {
  return [
    'point',
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
PointDrawingTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'creation',
  ].includes(actionIdentifier);
};

PointDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
  'hierarchyCreationService',
];

export default PointDrawingTool;

import paper from 'paper';
import CreationTool from '../CreationTool';
import PaperPedestrian from '../../Shapes/PaperPedestrian';
import Handle from '../../Shapes/Handles/Handle';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A tool for drawing pedestrian shapes with the mouse cursor
 *
 * This is a fixed aspect ratio rectangle shape drawn by specifying the height of the rectangle on the middle axis.
 */
class PedestrianDrawingTool extends CreationTool {
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
   * @param {CreationToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invokeShapeCreation(toolActionStruct) {
    this._pedestrian = null;
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

    const from = new paper.Point(
      video.metaData.width / 2,
      (video.metaData.height / 2) - (height / 2)
    );
    const to = new paper.Point(
      video.metaData.width / 2,
      (video.metaData.height / 2) + (height / 2)
    );
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

    let pedestrian = null;
    this._context.withScope(() => {
      pedestrian = new PaperPedestrian(
        labeledThingInFrame,
        this._entityIdService.getUniqueId(),
        from,
        to,
        this._entityColorService.getColorById(labeledThingInFrame.labeledThing.lineColor).primary,
        true
      );
      pedestrian.remove();
    });

    return this._complete(pedestrian);
  }

  /**
   * Abort the tool invocation.
   */
  abort() {
    if (this._pedestrian !== null) {
      this._pedestrian.remove();
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

    if (this._pedestrian !== null) {
      this._pedestrian.resize(this._creationHandle, point, this._getMinimalHeight());
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
    if (this._pedestrian === null) {
      this._reject(new NotModifiedError('No FixedAspectRatioRectangle was created/dragged.'));
      return;
    }

    // Fix bottom-right and top-left orientation
    this._pedestrian.fixOrientation();
    this._pedestrian.remove();

    this._complete(this._pedestrian);
  }

  /**
   * Start the initial drawing of a pedestrian
   *
   * @param {Point} from
   * @param {Point} to
   * @private
   */
  _startShape(from, to) {
    const labeledThingInFrame = this._createLabeledThingInFrameWithHierarchy();

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
      this._creationHandle = this._getScaleAnchor(to);
      this._pedestrian.resize(this._creationHandle, to, this._getMinimalHeight());
    });
  }


  /**
   * @param {paper.Point} point
   * @returns {Handle}
   * @private
   */
  _getScaleAnchor(point) {
    if (point.y > this._startPosition.y) {
      return new Handle('bottom-center', new paper.Point(this._startPosition.x, point.y));
    }
    return new Handle('top-center', new paper.Point(this._startPosition.x, point.y));
  }

  /**
   * @returns {number}
   * @private
   */
  _getMinimalHeight() {
    const {minimalHeight} = this._toolActionStruct.options;
    return minimalHeight && minimalHeight > 0 ? minimalHeight : 1;
  }
}

/**
 * Get the supported shape class of the tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {string}
 * @public
 * @abstract
 * @static
 */
PedestrianDrawingTool.getSupportedShapeClass = function() {
  return 'pedestrian';
};

/**
 * Retrieve a list of actions this tool is used for.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {Array.<string>}
 * @public
 * @abstract
 * @static
 */
PedestrianDrawingTool.getSupportedActionIdentifiers = function() {
  return [
    'creation',
  ];
};

PedestrianDrawingTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'entityIdService',
  'entityColorService',
];

export default PedestrianDrawingTool;

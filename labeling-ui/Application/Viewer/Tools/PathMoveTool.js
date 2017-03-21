import paper from 'paper';
import MovingTool from './MovingTool';
import NotModifiedError from './Errors/NotModifiedError';

/**
 * A Tool for moving polygon shapes
 */
class PathMoveTool extends MovingTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param $rootScope
   * @param $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * Mouse to center offset for moving a shape
     *
     * @type {Point}
     * @private
     */
    this._offset = null;

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;
  }

  /**
   * @param {MovingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeMoving(toolActionStruct) {
    this._offset = null;
    this._modified = false;

    return super.invokeShapeMoving(toolActionStruct);
  }

  /**
   * Request tool abortion
   */
  abort() {
    if (this._modified === false) {
      super.abort();
      return;
    }

    // If the shape was modified we simply resolve, what we have so far.
    const {shape} = this._toolActionStruct;
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDown(event) {
    const point = event.point;
    const {shape} = this._toolActionStruct;

    this._offset = new paper.Point(
      shape.position.x - point.x,
      shape.position.y - point.y
    );
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp() {
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Polygon wasn\'t moved in any way'));
      return;
    }

    const {shape} = this._toolActionStruct;
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;
    const {shape} = this._toolActionStruct;

    this._modified = true;
    this._moveTo(shape, point.add(this._offset));
  }

  /**
   * @param {PaperShape} shape
   * @param {paper.Point} point
   * @private
   */
  _moveTo(shape, point) {
    const {options} = this._toolActionStruct;
    this._context.withScope(() => {
      shape.moveTo(this._restrictToViewport(shape, point, options.minimalVisibleShapeOverflow === null ? undefined : options.minimalVisibleShapeOverflow));
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
PathMoveTool.getToolName = () => {
  return 'PathMoveTool';
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
PathMoveTool.isShapeClassSupported = shapeClass => {
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
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
PathMoveTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'move',
  ].includes(actionIdentifier);
};

PathMoveTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PathMoveTool;

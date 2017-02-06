import MovingTool from '../MovingTool';
import paper from 'paper';

/**
 * A Tool for moving cuboids in pseudo 3d space
 */
class CuboidMoveTool extends MovingTool {
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
    shape.updatePrimaryCorner();

    this._offset = new paper.Point(
      shape.position.x - point.x,
      shape.position.y - point.y
    );
  }

  onMouseUp() {
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Cuboid wasn\'t moved in any way'));
      return;
    }

    const {shape} = this._toolActionStruct;
    shape.updatePrimaryCorner();
    this._complete(shape);
  }

  /**
   * @param event
   */
  onMouseDrag(event) {
    const point = event.point;
    const {shape} = this._toolActionStruct;

    this._modified = true;
    this._moveTo(shape, point.add(this._offset));
  }

  /**
   * @returns {number}
   * @private
   */
  _getMinimalHeight() {
    const {minimalHeight} = this._toolActionStruct.options;
    return minimalHeight && minimalHeight > 0 ? minimalHeight : 1;
  }

  /**
   * @param {PaperCuboid} shape
   * @param {paper.Point} point
   * @private
   */
  _moveTo(shape, point) {
    this._context.withScope(() => {
      shape.moveTo(this._restrictToViewport(shape, point), this._getMinimalHeight());
    });
  }
}

CuboidMoveTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default CuboidMoveTool;

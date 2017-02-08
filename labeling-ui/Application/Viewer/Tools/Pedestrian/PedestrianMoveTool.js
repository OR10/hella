import paper from 'paper';
import MovingTool from '../MovingTool';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A Tool for moving annotation shapes
 */
class PedestrianMoveTool extends MovingTool {
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
   * @returns {string}
   */
  getToolName() {
    return 'pedestrian';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'move',
    ];
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
  onMouseUp(event) {
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Fixed Aspect Rectangle wasn\'t moved in any way'));
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
    this._context.withScope(() => {
      shape.moveTo(this._restrictToViewport(shape, point));
    });
  }
}

PedestrianMoveTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PedestrianMoveTool;

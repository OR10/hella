import ScalingTool from '../ScalingTool';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
class PolygonScaleTool extends ScalingTool {
  /**
   * @param {$rootScope} $rootScope
   * @param {DrawingContext} drawingContext
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    super(drawingContext, $rootScope, $q, loggerService);

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
    return 'polygon';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'scale',
    ];
  }

  /**
   * @param {ScalingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeScaling(toolActionStruct) {
    this._modified = false;

    return super.invokeShapeScaling(toolActionStruct);
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

  onMouseUp() {
    const {shape} = this._toolActionStruct;
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Polygon not scaled.'));
      return;
    }

    this._complete(shape);
  }

  onMouseDrag(event) {
    const point = event.point;
    const {shape, handle} = this._toolActionStruct;
    this._modified = true;

    this._context.withScope(() => {
      shape.resize(handle, point);
    });
  }
}

PolygonScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PolygonScaleTool;

import ScalingTool from '../ScalingTool';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A Tool for scaling annotation shapes
 */
class PedestrianScaleTool extends ScalingTool {
  /**
   * @param {$rootScope} $rootScope
   * @param {DrawingContext} drawingContext
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   */
  constructor(drawingContext, $rootScope, $q, loggerService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * Variable that holds the modified state of the current fixed aspect rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;
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

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    const {shape} = this._toolActionStruct;
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Fixed Aspect Rectangle not scaled.'));
      return;
    }

    shape.fixOrientation();
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;
    const {shape, handle} = this._toolActionStruct;
    this._modified = true;

    const {options: {minimalHeight}} = this._toolActionStruct;

    this._context.withScope(() => {
      shape.resize(handle, point, minimalHeight);
    });
  }
}

PedestrianScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default PedestrianScaleTool;

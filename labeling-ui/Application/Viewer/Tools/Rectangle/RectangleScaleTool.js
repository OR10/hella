import ScalingTool from '../ScalingTool';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A Tool for scaling rectangle shapes
 *
 * @implements ToolEvents
 */
class RectangleScaleTool extends ScalingTool {
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
   * @param {ScalingToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeScaling(toolActionStruct) {
    this._modified = null;

    return super.invokeShapeScaling(toolActionStruct);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    const {shape} = this._toolActionStruct;
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Rectangle not scaled.'));
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
    const minimalSize = {width: 1, height: minimalHeight};

    this._context.withScope(() => {
      shape.resize(handle, point, minimalSize);
    });
  }
}

RectangleScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default RectangleScaleTool;

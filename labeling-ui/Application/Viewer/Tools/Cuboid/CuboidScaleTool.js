import ScalingTool from '../ScalingTool';
import NotModifiedError from '../Errors/NotModifiedError';

/**
 * A Tool for scaling cuboids in pseudo 3d space
 */
class CuboidScaleTool extends ScalingTool {
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
  onMouseDown(event) {
    const {shape} = this._toolActionStruct;
    shape.updatePrimaryCorner();
  }

  /**
   * @param {paper.Event} event
   */
  onMouseUp(event) {
    if (this._modified !== true) {
      this._reject(new NotModifiedError('Cuboid wasn\'t resized in any way'));
      return;
    }

    const {shape} = this._toolActionStruct;
    shape.reduceToPseudo3dIfPossible();
    shape.updatePrimaryCorner();
    this._complete(shape);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseDrag(event) {
    const point = event.point;
    const {shape, handle} = this._toolActionStruct;

    this._modified = true;

    this._context.withScope(() => {
      shape.resize(handle, point, this._getMinimalHeight());
    });
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
CuboidScaleTool.getSupportedShapeClass = function() {
  return 'cuboid';
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
CuboidScaleTool.getSupportedActionIdentifiers = function() {
  return [
    'scale',
  ];
};

CuboidScaleTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
];

export default CuboidScaleTool;

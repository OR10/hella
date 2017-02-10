import paper from 'paper';
import Tool from './NewTool';

/**
 * A Tool for Zooming in and out
 *
 * @extends Tool
 */
class ZoomTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, viewerMouseCursorService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;
  }

  /**
   * @param {ZoomToolActionStruct} zoomToolActionStruct
   */
  invoke(zoomToolActionStruct) {
    const {mouseCursor} = zoomToolActionStruct;
    this._viewerMouseCursorService.setMouseCursor(mouseCursor);
    return this._invoke(zoomToolActionStruct);
  }

  abort() {
    this._viewerMouseCursorService.setMouseCursor(null);
    super.abort();
  }

  /**
   * @param {paper.Event} event
   */
  onMouseClick(event) {
    const nativeEvent = event.event;
    if (nativeEvent.shiftKey || nativeEvent.altKey || nativeEvent.ctrlKey || nativeEvent.metaKey) {
      return;
    }

    this._toolActionStruct.zoomFunction(
      new paper.Point(
        nativeEvent.offsetX,
        nativeEvent.offsetY
      ),
      1.5
    );

    this._viewerMouseCursorService.setMouseCursor(null);
    this._complete(true);
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
ZoomTool.getToolName = function () {
  return 'ZoomTool';
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
ZoomTool.isShapeClassSupported = function (shapeClass) {
  return [
    'zoom',
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
ZoomTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'in',
    'out',
  ].includes(actionIdentifier);
};

ZoomTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'viewerMouseCursorService',
];

export default ZoomTool;

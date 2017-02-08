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
   * @returns {string}
   */
  getToolName() {
    return 'zoom';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'in',
      'out',
    ];
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

ZoomTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'viewerMouseCursorService',
];

export default ZoomTool;

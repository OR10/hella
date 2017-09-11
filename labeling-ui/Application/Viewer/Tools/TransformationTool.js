import PaperTool from './PaperTool';
import NotModifiedError from './Errors/NotModifiedError';

class TransformationTool extends PaperTool {
  constructor(drawingContext, $rootScope, $q, loggerService, viewerMouseCursorService) {
    super(drawingContext, $rootScope, $q, loggerService);

    this._viewerMouseCursorService = viewerMouseCursorService;
  }

  /**
   * Invoke the tool to start its workflow.
   * The returning promise is resolved after the
   * tool workflow is finished.
   *
   * @param {TransformationToolActionStruct} toolActionStruct
   * @returns {Promise}
   */
  invokeShapeTransformation(toolActionStruct) {
    return this._invoke(toolActionStruct);
  }

  // TODO: Move to PaperTool
  onMouseMove(event) {
    const keyboardModifiers = this._getKeyboardModifiers(event);
    const point = event.point;
    const {shape} = this._toolActionStruct;

    const [, hitHandle = null] = this._getHitShapeAndHandle(point);
    this._viewerMouseCursorService.setMouseCursor(shape.getCursor(hitHandle, undefined, keyboardModifiers));
  }

  onKeyUp(event) {
    const keyIdentifier = event.key;

    if (keyIdentifier === 'option') {
      this._reject(new NotModifiedError('Transformation aborted due to user request (option key was let go)'));
    }
  }
}

TransformationTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'viewerMouseCursorService',
];

export default TransformationTool;

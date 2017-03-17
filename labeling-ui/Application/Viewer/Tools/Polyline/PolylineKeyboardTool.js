import paper from 'paper';
import KeyboardTool from '../KeyboardTool';

/**
 * Keyboard shortcuts for rectangle shapes
 *
 * @extends KeyboardTool
 */
class PolylineKeyboardTool extends KeyboardTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {EntityIdService} entityIdService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, keyboardShortcutService, entityIdService) {
    super(drawingContext, $rootScope, $q, loggerService, keyboardShortcutService, entityIdService);
  }

  /**
   * @param {KeyboardToolActionStruct} keyboardToolActionStruct
   */
  invokeKeyboardShortcuts(keyboardToolActionStruct) {
    const promise = super.invokeKeyboardShortcuts(keyboardToolActionStruct);

    const keyboardMoveDistance = 1;
    const keyboardFastMoveDistance = 10;

    this._registerKeyboardShortcut(
      'up',
      'Move selected shape up',
      () => this._moveSelectedShapeBy(0, keyboardMoveDistance * -1)
    );

    this._registerKeyboardShortcut(
      'shift+up',
      'Move selected shape up (fast)',
      () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance * -1)
    );

    this._registerKeyboardShortcut(
      'down',
      'Move selected shape down',
      () => this._moveSelectedShapeBy(0, keyboardMoveDistance)
    );

    this._registerKeyboardShortcut(
      'shift+down',
      'Move selected shape down (fast)',
      () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance)
    );

    this._registerKeyboardShortcut(
      'left',
      'Move selected shape left',
      () => this._moveSelectedShapeBy(keyboardMoveDistance * -1, 0)
    );

    this._registerKeyboardShortcut(
      'shift+left',
      'Move selected shape left (fast)',
      () => this._moveSelectedShapeBy(keyboardFastMoveDistance * -1, 0)
    );

    this._registerKeyboardShortcut(
      'right',
      'Move selected shape right',
      () => this._moveSelectedShapeBy(keyboardMoveDistance, 0)
    );

    this._registerKeyboardShortcut(
      'shift+right',
      'Move selected shape right (fast)',
      () => this._moveSelectedShapeBy(keyboardFastMoveDistance, 0)
    );

    return promise;
  }

  /**
   * @param {Number} deltaX
   * @param {Number} deltaY
   * @private
   */
  _moveSelectedShapeBy(deltaX, deltaY) {
    const {shape} = this._toolActionStruct;
    this._context.withScope(scope => {
      shape.moveTo(
        new paper.Point(
          shape.position.x + deltaX,
          shape.position.y + deltaY
        ),
        this._options
      );
      scope.view.update();
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
PolylineKeyboardTool.getToolName = () => {
  return 'PolylineKeyboardTool';
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
PolylineKeyboardTool.isShapeClassSupported = shapeClass => {
  return [
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
PolylineKeyboardTool.isActionIdentifierSupported = actionIdentifier => {
  return [
    'keyboard',
  ].includes(actionIdentifier);
};

PolylineKeyboardTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'keyboardShortcutService',
  'entityIdService',
];

export default PolylineKeyboardTool;

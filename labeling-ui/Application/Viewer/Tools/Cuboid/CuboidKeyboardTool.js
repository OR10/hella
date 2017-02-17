import paper from 'paper';
import KeyboardTool from '../KeyboardTool';
import CuboidInteractionResolver from '../../../ThirdDimension/Support/CuboidInteractionResolver.js'

/**
 * Keyboard shortcuts for rectangle shapes
 *
 * @extends KeyboardTool
 */
class CuboidKeyboardTool extends KeyboardTool {
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
      () => this._moveSelectedShapeBy(0, keyboardMoveDistance * -1),
    );

    this._registerKeyboardShortcut(
      'shift+up',
      'Move selected shape up (fast)',
      () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance * -1),
    );

    this._registerKeyboardShortcut(
      'down',
      'Move selected shape down',
      () => this._moveSelectedShapeBy(0, keyboardMoveDistance),
    );

    this._registerKeyboardShortcut(
      'shift+down',
      'Move selected shape down (fast)',
      () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance),
    );

    this._registerKeyboardShortcut(
      'left',
      'Move selected shape left',
      () => this._moveSelectedShapeBy(keyboardMoveDistance * -1, 0),
    );

    this._registerKeyboardShortcut(
      'shift+left',
      'Move selected shape left (fast)',
      () => this._moveSelectedShapeBy(keyboardFastMoveDistance * -1, 0),
    );

    this._registerKeyboardShortcut(
      'right',
      'Move selected shape right',
      () => this._moveSelectedShapeBy(keyboardMoveDistance, 0),
    );

    this._registerKeyboardShortcut(
      'shift+right',
      'Move selected shape right (fast)',
      () => this._moveSelectedShapeBy(keyboardFastMoveDistance, 0),
    );

    const rotationDegrees = 2;
    const fastRotationDegrees = 10;
    const scaleDistance = 1;
    const fastScaleDistance = 6;

    this._registerKeyboardShortcut(
      'o',
      `Rotate cuboid counter clockwise by ${rotationDegrees}°`,
      () => this._rotateCuboid(this._deg2rad(rotationDegrees)),
    );
    this._registerKeyboardShortcut(
      'p',
      `Rotate cuboid clockwise by ${rotationDegrees}°`,
      () => this._rotateCuboid(this._deg2rad(rotationDegrees * -1)),
    );
    this._registerKeyboardShortcut(
      'shift+o',
      `Rotate cuboid counter clockwise by ${fastRotationDegrees}°`,
      () => this._rotateCuboid(this._deg2rad(fastRotationDegrees)),
    );
    this._registerKeyboardShortcut(
      'shift+p',
      `Rotate cuboid clockwise by ${fastRotationDegrees}°`,
      () => this._rotateCuboid(this._deg2rad(fastRotationDegrees * -1)),
    );
    this._registerKeyboardShortcut(
      'i',
      'Change cuboid faces counter clockwise',
      () => this._rotateCuboidFaces(false),
    );
    this._registerKeyboardShortcut(
      'u',
      'Change cuboid faces clockwise',
      () => this._rotateCuboidFaces(true),
    );
    this._registerKeyboardShortcut(
      '8',
      `Add approx. ${scaleDistance}px to cuboid height`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance),
    );
    this._registerKeyboardShortcut(
      '2',
      `Substract approx. ${scaleDistance}px from cuboid height`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance * -1),
    );
    this._registerKeyboardShortcut(
      'shift+8',
      `Add approx. ${fastScaleDistance}px to cuboid height`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance),
    );
    this._registerKeyboardShortcut(
      'shift+2',
      `Substract approx. ${fastScaleDistance}px from cuboid height`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance * -1),
    );
    this._registerKeyboardShortcut(
      '4',
      `Add approx. ${scaleDistance}px to cuboid width`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance),
    );
    this._registerKeyboardShortcut(
      '6',
      `Substract approx. ${scaleDistance}px from cuboid width`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance * -1),
    );
    this._registerKeyboardShortcut(
      'shift+4',
      `Add approx. ${fastScaleDistance}px to cuboid width`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance),
    );
    this._registerKeyboardShortcut(
      'shift+6',
      `Substract approx. ${fastScaleDistance}px from cuboid width`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance * -1),
    );
    this._registerKeyboardShortcut(
      '9',
      `Add approx. ${scaleDistance}px to cuboid depth`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance),
    );
    this._registerKeyboardShortcut(
      '3',
      `Substract approx. ${scaleDistance}px from cuboid depth`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance * -1),
    );
    this._registerKeyboardShortcut(
      'shift+9',
      `Add approx. ${fastScaleDistance}px to cuboid depth`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance),
    );
    this._registerKeyboardShortcut(
      'shift+3',
      `Substract approx. ${fastScaleDistance}px from cuboid depth`,
      () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance * -1),
    );

    return promise;
  }

  _resizeCuboidByDistance(handleName, distance) {
    /**
     * @type {PaperCuboid}
     */
    const {shape} = this._toolActionStruct;
    const {options} = this._toolActionStruct;

    const minimalHeight = (options.minimalHeight !== undefined) ? options.minimalHeight : 1;

    this._context.withScope(scope => {
      shape.resizeByDistance(handleName, distance, minimalHeight);
      scope.view.update();
    });
  }

  /**
   * Converts degree to radiant
   *
   * @param degree
   * @returns {number}
   * @private
   */
  _deg2rad(degree) {
    return 2 * Math.PI / 360 * degree;
  }

  /**
   * @param {number} degree
   * @private
   */
  _rotateCuboid(degree) {
    const shape = this._toolActionStruct.shape;
    this._context.withScope(scope => {
      shape.rotateAroundCenter(degree);
      shape.updatePrimaryCorner();
      scope.view.update();
    });
  }


  /**
   * @param {boolean} clockwise
   * @private
   */
  _rotateCuboidFaces(clockwise) {
    const {shape} = this._toolActionStruct;
    this._context.withScope(scope => {
      shape.rotateFaces(clockwise);
      shape.updatePrimaryCorner();
      scope.view.update();
    });
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
CuboidKeyboardTool.getToolName = function () {
  return 'CuboidKeyboardTool';
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
CuboidKeyboardTool.isShapeClassSupported = function (shapeClass) {
  return [
    'cuboid',
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
CuboidKeyboardTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'keyboard',
  ].includes(actionIdentifier);
};

CuboidKeyboardTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'keyboardShortcutService',
  'entityIdService',
];

export default CuboidKeyboardTool;

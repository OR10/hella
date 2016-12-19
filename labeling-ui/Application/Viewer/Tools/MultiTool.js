import Tool from './Tool';
import paper from 'paper';
import PaperRectangle from '../../Viewer/Shapes/PaperRectangle';
import PaperPedestrian from '../../Viewer/Shapes/PaperPedestrian';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import PaperPolygon from '../../Viewer/Shapes/PaperPolygon';
import CuboidInteractionResolver from '../../ThirdDimension/Support/CuboidInteractionResolver';
import hitResolver from '../Support/HitResolver';

/**
 * A multi tool for handling multiple functionalities
 *
 * @extends Tool
 */
export default class MultiTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {Boolean} readOnly
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ToolService} toolService
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, keyboardShortcutService, toolService, drawingContext, readOnly, options) {
    super(drawingContext, options);

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {Boolean}
     */
    this._readOnly = readOnly;

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {ToolService}
     * @private
     */
    this._toolService = toolService;

    /**
     * The currently active tool
     *
     * @type {Tool}
     * @private
     */
    this._activeTool = null;

    /**
     * State if the multi tool ist currently enabled
     *
     * @type {boolean}
     * @private
     */
    this._enabled = true;

    /**
     * @type {boolean}
     * @private
     */
    this._toolWorking = false;

    // Bind tool events to controller actions
    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
    this._tool.onMouseMove = event => $scope.$evalAsync(() => this._mouseMove(event));

    // Create event callbacks
    this._onShapeCreate = shape => {
      this.emit('shape:create', shape);
    };

    this._onShapeUpdate = shape => {
      this.emit('shape:update', shape);
    };

    this._onToolFinished = () => {
      this._toolWorking = false;
    };

    /**
     * @param event
     */
    document.onkeypress = event => {
      this._activeTool.onKeyPress(event.keyCode);
    };

    if (!this._readOnly) {
      // Register Keyboard shortcuts
      this._registerShortcuts();
    }
  }

  _setDrawingTool(tool) {
    switch (tool) {
      case 'rectangle':
        this._setActiveToolAndRegisterEvents(this._toolService.getTool(this._$scope, this._context, PaperRectangle.getClass()));
        break;
      case 'pedestrian':
        this._setActiveToolAndRegisterEvents(this._toolService.getTool(this._$scope, this._context, PaperPedestrian.getClass()));
        break;
      case 'cuboid':
        this._setActiveToolAndRegisterEvents(this._toolService.getTool(this._$scope, this._context, PaperCuboid.getClass()));
        break;
      case 'polygon':
        this._setActiveToolAndRegisterEvents(this._toolService.getTool(this._$scope, this._context, PaperPolygon.getClass()));
        break;
      default:
        throw new Error(`Cannot instantiate tool of unknown type ${tool}.`);
    }
  }

  _registerShortcuts() {
    const keyboardMoveDistance = 1;
    const keyboardFastMoveDistance = 10;
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'up',
      description: 'Move selected shape up',
      callback: () => this._moveSelectedShapeBy(0, keyboardMoveDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+up',
      description: 'Move selected shape up (fast)',
      callback: () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance * -1),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'down',
      description: 'Move selected shape down',
      callback: () => this._moveSelectedShapeBy(0, keyboardMoveDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+down',
      description: 'Move selected shape down (fast)',
      callback: () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'left',
      description: 'Move selected shape left',
      callback: () => this._moveSelectedShapeBy(keyboardMoveDistance * -1, 0),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+left',
      description: 'Move selected shape left (fast)',
      callback: () => this._moveSelectedShapeBy(keyboardFastMoveDistance * -1, 0),
    });

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'right',
      description: 'Move selected shape right',
      callback: () => this._moveSelectedShapeBy(keyboardMoveDistance, 0),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+right',
      description: 'Move selected shape right (fast)',
      callback: () => this._moveSelectedShapeBy(keyboardFastMoveDistance, 0),
    });

    // @TODO: Only register if we are really working with a cuboid;
    this._registerCuboidShortcuts();
  }

  _registerCuboidShortcuts() {
    const rotationDegrees = 2;
    const fastRotationDegrees = 10;
    const scaleDistance = 1;
    const fastScaleDistance = 6;

    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'o',
      description: `Rotate cuboid counter clockwise by ${rotationDegrees}°`,
      callback: () => this._rotateCuboid(this._deg2rad(rotationDegrees)),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'p',
      description: `Rotate cuboid clockwise by ${rotationDegrees}°`,
      callback: () => this._rotateCuboid(this._deg2rad(rotationDegrees * -1)),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+o',
      description: `Rotate cuboid counter clockwise by ${fastRotationDegrees}°`,
      callback: () => this._rotateCuboid(this._deg2rad(fastRotationDegrees)),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+p',
      description: `Rotate cuboid clockwise by ${fastRotationDegrees}°`,
      callback: () => this._rotateCuboid(this._deg2rad(fastRotationDegrees * -1)),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'i',
      description: 'Change cuboid faces counter clockwise',
      callback: () => this._rotateCuboidFaces(false),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'u',
      description: 'Change cuboid faces clockwise',
      callback: () => this._rotateCuboidFaces(true),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '8',
      description: `Add approx. ${scaleDistance}px to cuboid height`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '2',
      description: `Substract approx. ${scaleDistance}px from cuboid height`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+8',
      description: `Add approx. ${fastScaleDistance}px to cuboid height`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+2',
      description: `Substract approx. ${fastScaleDistance}px from cuboid height`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '4',
      description: `Add approx. ${scaleDistance}px to cuboid width`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '6',
      description: `Substract approx. ${scaleDistance}px from cuboid width`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+4',
      description: `Add approx. ${fastScaleDistance}px to cuboid width`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+6',
      description: `Substract approx. ${fastScaleDistance}px from cuboid width`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '9',
      description: `Add approx. ${scaleDistance}px to cuboid depth`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '3',
      description: `Substract approx. ${scaleDistance}px from cuboid depth`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance * -1),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+9',
      description: `Add approx. ${fastScaleDistance}px to cuboid depth`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'shift+3',
      description: `Substract approx. ${fastScaleDistance}px from cuboid depth`,
      callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance * -1),
    });
  }

  _resizeCuboidByDistance(handleName, distance) {
    /**
     * @type {PaperCuboid}
     */
    const cuboid = this._$scope.vm.selectedPaperShape;
    if (!(cuboid instanceof PaperCuboid)) {
      return;
    }

    const minimalHeight = (
      this._$scope.vm.task.drawingToolOptions.cuboid &&
      this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight &&
      this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight > 0
    )
      ? this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight
      : 1;

    this._context.withScope(scope => {
      cuboid.resizeByDistance(handleName, distance, minimalHeight);
      scope.view.update();
      this.emit('shape:update', cuboid);
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

  enable() {
    this._enabled = true;
    this._keyboardShortcutService.enable();
  }

  disable() {
    this._enabled = false;
    this._keyboardShortcutService.disable();
  }

  /**
   * @param {number} degree
   * @private
   */
  _rotateCuboid(degree) {
    // TODO: refactor this into a separate cuboid-rotate tool !!!
    const shape = this._$scope.vm.selectedPaperShape;
    if (shape instanceof PaperCuboid) {
      this._context.withScope(scope => {
        shape.rotateAroundCenter(degree);
        shape.updatePrimaryCorner();
        scope.view.update();
        this.emit('shape:update', shape);
      });
    }
  }

  /**
   * @param {boolean} clockwise
   * @private
   */
  _rotateCuboidFaces(clockwise) {
    // TODO: refactor this into a separate cuboid-rotate tool !!!
    const shape = this._$scope.vm.selectedPaperShape;
    if (shape instanceof PaperCuboid) {
      this._context.withScope(scope => {
        shape.rotateFaces(clockwise);
        shape.updatePrimaryCorner();
        scope.view.update();
        this.emit('shape:update', shape);
      });
    }
  }

  /**
   * @param {Number} deltaX
   * @param {Number} deltaY
   * @private
   */
  _moveSelectedShapeBy(deltaX, deltaY) {
    if (!this._enabled) {
      return;
    }

    const paperShape = this._$scope.vm.selectedPaperShape;
    if (!paperShape) {
      return;
    }

    this._context.withScope(scope => {
      paperShape.moveTo(
        new paper.Point(
          paperShape.position.x + deltaX,
          paperShape.position.y + deltaY
        ),
        this._options
      );
      scope.view.update();
      this.emit('shape:update', paperShape);
    });
  }

  /**
   * @param {paper.Event} event
   * @private
   */
  _mouseMove(event) {
    if (event.event.shiftKey) {
      return;
    }

    if (!this._enabled) {
      return;
    }

    if (!this._toolWorking) {
      this._handleMouseMoveCursor(event.point);
    }

    if (this._activeTool) {
      this._activeTool.onMouseMove(event);
    }
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseMoveCursor(point) {
    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._options.hitTestTolerance,
      });

      if (!hitResult) {
        if (this._$scope.vm.showCrosshairs === true) {
          this._$scope.vm.actionMouseCursor = 'none';
        } else {
          this._$scope.vm.actionMouseCursor = null;
        }
      } else {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        this._$scope.vm.actionMouseCursor = hitShape.getCursor(hitHandle);
      }
    });
  }

  /**
   * @param {paper.Event} event
   * @private
   */
  _mouseDown(event) {
    if (event.event.shiftKey) {
      return;
    }

    if (!this._enabled) {
      return;
    }
    const point = event.point;

    if (this._toolWorking) {
      this._activeTool.onMouseDown(event);
      return;
    }
    this._handleMouseDownCursor(point);

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._options.hitTestTolerance,
      });


      if (hitResult) {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        const actionIdentifier = hitShape.getToolActionIdentifier(hitHandle);

        this._toolWorking = true;
        this._setActiveToolAndRegisterEvents(this._toolService.getTool(this._$scope, this._context, hitShape.getClass(), actionIdentifier));
        this._activeTool.onMouseDown(event, hitShape, hitHandle);
      } else {
        this._toolWorking = true;
        if (this._$scope.vm.selectedDrawingTool === null) {
          return;
        }
        this._setDrawingTool(this._$scope.vm.selectedDrawingTool);
        this._activeTool.onMouseDown(event);
      }
    });
  }

  _setActiveToolAndRegisterEvents(tool) {
    if (this._activeTool) {
      // Unregister event listeners
      this._activeTool.removeListener('shape:create', this._onShapeCreate);
      this._activeTool.removeListener('shape:update', this._onShapeUpdate);
      this._activeTool.removeListener('tool:finished', this._onToolFinished);
    }

    this._activeTool = tool;

    // Register new event listeners
    this._activeTool.on('shape:create', this._onShapeCreate);
    this._activeTool.on('shape:update', this._onShapeUpdate);
    this._activeTool.on('tool:finished', this._onToolFinished);
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseDownCursor(point) {
    if (this._$scope.vm.showCrosshairs === true) {
      this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = 'none');
    } else {
      this._context.withScope(scope => {
        const hitResult = scope.project.hitTest(point, {
          fill: true,
          bounds: false,
          tolerance: this._options.hitTestTolerance,
        });

        if (hitResult) {
          const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
          this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = hitShape.getCursor(hitHandle, true));
        }
      });
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _mouseUp(event) {
    if (event.shiftkey) {
      return;
    }
    if (!this._enabled) {
      return;
    }
    if (!this._toolWorking) {
      this._handleMouseUpCursor(event.point);
    }
    if (this._activeTool) {
      this._activeTool.onMouseUp(event);
    }
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseUpCursor(point) {
    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._options.hitTestTolerance,
      });
      if (hitResult) {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = hitShape.getCursor(hitHandle, false));
      }
    });
  }

  /**
   * @param {paper.Event} event
   * @private
   */
  _mouseDrag(event) {
    if (event.event.shiftKey) {
      return;
    }

    if (!this._enabled) {
      return;
    }

    this._toolWorking = true;
    this._activeTool.onMouseDrag(event);
  }

  /**
   * @param {paper.Event} event
   */
  onMouseLeave(event) {
    if (!this._enabled) {
      return;
    }

    this._mouseUp(event);
  }

  createNewDefaultShape() {
    this._setDrawingTool(this._$scope.vm.selectedLabelStructureThing.shape);
    this._activeTool.createNewDefaultShape();
  }
}

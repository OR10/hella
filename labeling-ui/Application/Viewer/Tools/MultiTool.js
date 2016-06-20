import Tool from './Tool';
import paper from 'paper';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import hitResolver from '../Support/HitResolver';

/**
 * A multi tool for handling multiple functionalities
 *
 * @extends Tool
 */
export default class MultiTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ToolService} toolService
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, keyboardShortcutService, toolService, drawingContext, options) {
    super(drawingContext, options);

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

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
     * Tool handling the creation of things
     *
     * @type {Tool}
     * @private
     */
    this._createTool = null;

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

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
    this._tool.onMouseMove = event => $scope.$evalAsync(() => this._mouseMove(event));

    // Register keyboard shortcuts
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
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'o',
      description: 'Rotate cuboid counter clockwise by 5°',
      callback: () => this._rotateCuboid(0.087266),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'p',
      description: 'Rotate cuboid clockwise by 5°',
      callback: () => this._rotateCuboid(-0.087266),
    });
  }

  /**
   * Register a tool for handling the creation of things
   *
   * @param {ToolEvents} tool
   */
  registerCreateTool(tool) {
    this._createTool = tool;
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
      this._context.withScope((scope) => {
        shape.rotateAroundCenter(degree);
        shape.updatePrimaryCorner();
        scope.view.update();
        this.emit('shape:update', shape);
      });
    }
  }

  _moveSelectedShapeBy(deltaX, deltaY) {
    if (!this._enabled) {
      return;
    }

    const paperShape = this._$scope.vm.selectedPaperShape;
    if (!paperShape) {
      return;
    }

    this._moveTool.moveTo(
      paperShape,
      new paper.Point(
        paperShape.position.x + deltaX,
        paperShape.position.y + deltaY
      )
    );
  }

  _mouseMove(event) {
    if (!this._enabled) {
      return;
    }

    this._context.withScope(scope => {
      const point = event.point;
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

  _mouseDown(event) {
    if (!this._enabled || event.event.shiftKey) {
      return;
    }

    if (this._$scope.vm.showCrosshairs === true) {
      this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = 'none');
    }

    const point = event.point;

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        const actionIdentifier = hitShape.getToolActionIdentifier(hitHandle);

        this._activeTool = this._toolService.getTool(this._$scope, this._context, hitShape.getClass(), actionIdentifier);
        if (this._$scope.vm.showCrosshairs === false) {
          this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = hitShape.getCursor(hitHandle, true));
        }

        if (this._activeTool !== null) {
          this._activeTool.onMouseDown(event, hitShape, hitHandle);
          this._activeTool.on('shape:update', shape => {
            this.emit('shape:update', shape);
          });
        }
      } else {
        this._activeTool = this._createTool;
        this._activeTool.onMouseDown(event);
      }
    });
  }

  _mouseUp(event) {
    if (!this._enabled) {
      return;
    }

    if (this._activeTool) {
      this._context.withScope(scope => {
        const hitResult = scope.project.hitTest(event.point, {
          fill: true,
          bounds: false,
          tolerance: this._options.hitTestTolerance,
        });
        if (hitResult) {
          const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
          this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = hitShape.getCursor(hitHandle, false));
        }
      });

      this._activeTool.onMouseUp(event);
      this._activeTool = null;
    }
  }

  _mouseDrag(event) {
    if (!this._enabled) {
      return;
    }

    if (this._activeTool) {
      this._activeTool.onMouseDrag(event);
    }
  }

  onMouseLeave(event) {
    if (!this._enabled) {
      return;
    }

    this._mouseUp(event);
  }
}

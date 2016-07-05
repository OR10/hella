import Tool from './Tool';
import paper from 'paper';
import PaperRectangle from '../../Viewer/Shapes/PaperRectangle';
import PaperPedestrian from '../../Viewer/Shapes/PaperPedestrian';
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

    /**
     * @type {Map}
     * @private
     */
    this._toolEventHandles = new Map();

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
    this._tool.onMouseMove = event => $scope.$evalAsync(() => this._mouseMove(event));

    /**
     * @param event
     */
    document.onkeypress = event => {
      this._activeTool.onKeyPress(event.keyCode);
    };

    this._setDrawingTool();
    this._registerEventHandler();

    // Register Keyboard shortcuts
    this._registerShortcuts();
  }

  _setDrawingTool() {
    switch (this._$scope.vm.task.drawingTool) {
      case 'rectangle':
        this._activeTool = this._toolService.getTool(this._$scope, this._context, PaperRectangle.getClass());
        break;
      case 'pedestrian':
        this._activeTool = this._toolService.getTool(this._$scope, this._context, PaperPedestrian.getClass());
        break;
      case 'cuboid':
        this._activeTool = this._toolService.getTool(this._$scope, this._context, PaperCuboid.getClass());
        break;
      default:
        throw new Error(`Cannot instantiate tool of unknown type ${this._$scope.vm.task.drawingTool}.`);
    }
  }

  _registerEventHandler() {
    this._activeTool.on('shape:start', shape => {
      this._$scope.vm.labeledThingsInFrame.push(shape.labeledThingInFrame);
      // The new shape has been rerendered now lets find it
      const newShape = this._context.withScope(scope =>
        scope.project.getItem({
          id: shape.id,
        })
      );
      this._$scope.vm.selectedPaperShape = newShape;
      this.emit('shape:new', newShape);
    });

    this._activeTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    this._activeTool.on('shape:finished', () => {
      this._toolWorking = false;
    });
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
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: 'ß',
      description: 'Change cuboid faces counter clockwise',
      callback: () => this._rotateCuboidFaces(false),
    });
    this._keyboardShortcutService.addHotkey('labeling-task', {
      combo: '0',
      description: 'Change cuboid faces clockwise',
      callback: () => this._rotateCuboidFaces(true),
    });
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
        )
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
    if (!this._enabled) {
      return;
    }

    if (!this._toolWorking) {
      this._handleMouseMoveCursor(event.point);
    }
    this._activeTool.onMouseMove(event);
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
    if (!this._enabled || event.event.shiftKey) {
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
        this._activeTool = this._toolService.getTool(this._$scope, this._context, hitShape.getClass(), actionIdentifier);
        this._activeTool.onMouseDown(event, hitShape, hitHandle);

        if (!this._toolEventHandles.has(`${hitShape.getClass}-${actionIdentifier}`)) {
          this._registerEventHandler();
        }
      } else {
        this._toolWorking = true;
        this._setDrawingTool();
        this._activeTool.onMouseDown(event);
      }
    });
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
   * @param {paper.Event} event
   * @private
   */
  _mouseUp(event) {
    if (!this._enabled) {
      return;
    }
    if (!this._toolWorking) {
      this._handleMouseUpCursor(event.point);
    }
    this._activeTool.onMouseUp(event);
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
    this._setDrawingTool();
    this._activeTool.createNewDefaultShape();
  }
}

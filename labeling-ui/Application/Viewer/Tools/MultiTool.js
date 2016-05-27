import Tool from './Tool';
import paper from 'paper';

import PaperShape from '../Shapes/PaperShape';

/**
 * A multi tool for handling multiple functionalities
 *
 * @extends Tool
 */
export default class MultiTool extends Tool {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, keyboardShortcutService, drawingContext, options) {
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
     * Tool handling the creation of things
     *
     * @type {Tool}
     * @private
     */
    this._scaleTool = null;

    /**
     * Tool handling the movement of things
     *
     * @type {Tool}
     * @private
     */
    this._moveTool = null;

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
  }

  /**
   * Register a tool for handling the moving of things
   *
   * @param {ToolEvents} tool
   */
  registerMoveTool(tool) {
    this._moveTool = tool;
  }

  /**
   * Register a tool for handling the scaling of things
   *
   * @param {ToolEvents} tool
   */
  registerScaleTool(tool) {
    this._scaleTool = tool;
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

      //TODO: toolservice -> getTool(hitTestItem.class, hitTestItem.getToolActionIdentifier);

      if (!hitResult) {
        this._$scope.vm.actionMouseCursor = null;
      } else {
        this._$scope.vm.actionMouseCursor = hitResult.item.parent.getCursor(hitResult);
      }
    });
  }

  _mouseDown(event) {
    if (!this._enabled) {
      return;
    }

    const point = event.point;

    if (event.event.shiftKey) {
      return;
    }

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        class: PaperShape,
        fill: true,
        bounds: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._hitResult = hitResult;
        switch (this._hitResult.type) {
          case 'bounds':
            this._activeTool = this._scaleTool;
            this._activeTool.onMouseDown(event, hitResult);
            break;
          case 'fill':
            this._activeTool = this._moveTool;
            this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = 'grabbing');
            this._activeTool.onMouseDown(event, hitResult);
            break;
          default:
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
      if (this._activeTool === this._moveTool) {
        this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = 'grab');
      }

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

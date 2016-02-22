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
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);

    /**
     * @type {$rootScope.Scope}
     * @private
     */
    this._$scope = $scope;

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

    this._tool.onKeyDown = this._keyDown.bind(this);
    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
    this._tool.onMouseMove = event => $scope.$evalAsync(() => this._mouseMove(event));
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

  _keyDown(event) {
    const paperShape = this._$scope.vm.selectedPaperShape;
    if (paperShape) {
      const moveDistance = event.event.shiftKey ? 10 : 1;
      switch (event.key) {
        case 'right':
          this._moveTool.moveTo(paperShape, new paper.Point(paperShape.position.x + moveDistance, paperShape.position.y));
          break;
        case 'left':
          this._moveTool.moveTo(paperShape, new paper.Point(paperShape.position.x - moveDistance, paperShape.position.y));
          break;
        case 'up':
          this._moveTool.moveTo(paperShape, new paper.Point(paperShape.position.x, paperShape.position.y - moveDistance));
          break;
        case 'down':
          this._moveTool.moveTo(paperShape, new paper.Point(paperShape.position.x, paperShape.position.y + moveDistance));
          break;
        default:
          return;
      }
    }
  }

  _mouseMove(event) {
    this._context.withScope(scope => {
      const point = event.point;
      const hitResult = scope.project.hitTest(point, {
        class: PaperShape,
        fill: true,
        bounds: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (!hitResult) {
        this._$scope.vm.actionMouseCursor = null;
        return;
      }

      if (hitResult.type === 'fill') {
        this._$scope.vm.actionMouseCursor = 'grab';
        return;
      }

      switch (hitResult.name) {
        case 'top-left':
          this._$scope.vm.actionMouseCursor = 'nwse-resize';
          break;
        case 'bottom-right':
          this._$scope.vm.actionMouseCursor = 'nwse-resize';
          break;
        case 'top-right':
          this._$scope.vm.actionMouseCursor = 'nesw-resize';
          break;
        case 'bottom-left':
          this._$scope.vm.actionMouseCursor = 'nesw-resize';
          break;
        default:
          this._$scope.vm.actionMouseCursor = null;
      }
    });
  }

  _mouseDown(event) {
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
    if (this._activeTool) {
      if (this._activeTool === this._moveTool) {
        this._$scope.$apply(() => this._$scope.vm.actionMouseCursor = 'grab');
      }

      this._activeTool.onMouseUp(event);
      this._activeTool = null;
    }
  }

  _mouseDrag(event) {
    if (this._activeTool) {
      this._activeTool.onMouseDrag(event);
    }
  }

  onMouseLeave(event) {
    this._mouseUp(event);
  }
}

import paper from 'paper';
import Tool from './Tool';
import PaperShape from '../Shapes/PaperShape';

/**
 * A multi tool for handling multiple functionalities
 *
 * @extends Tool
 */
export default class MultiTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor(drawingContext, options) {
    super(drawingContext, options);

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

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
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

  _mouseDown(event) {
    const point = event.point;

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        class: PaperShape,
        fill: true,
        bounds: true,
        segments: true,
        curves: true,
        center: true,
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
            this._activeTool.onMouseDown(event, hitResult);
            break;
          default:
        }
      } else{
        this._activeTool = this._createTool;
        this._activeTool.onMouseDown(event);
      }
    });
  }

  _mouseUp(event) {
    if (this._activeTool) {
      this._activeTool.onMouseUp(event);
    }
  }

  _mouseDrag(event) {
    if (this._activeTool) {
      this._activeTool.onMouseDrag(event);
    }
  }

}

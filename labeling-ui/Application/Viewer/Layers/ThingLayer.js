import paper from 'paper';

import PaperLayer from './PaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import RectangleModificationTool from '../Tools/RectangleModificationTool';
import RectangleRenderer from '../Renderer/RectangleRenderer';

/**
 * A Layer used to draw Things within the viewer
 *
 * @class ThingLayer
 * @extends PaperLayer
 */
export default class ThingLayer extends PaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super(drawingContextService);

    /**
     * Renderer used by this layer to draw labeling rectangles loaded from the backend
     *
     * @type {RectangleRenderer}
     * @private
     */
    this._rectangleRenderer = new RectangleRenderer();

    /**
     * Storage used to manage the currently displayed things
     *
     * @type {Map}
     * @private
     */
    this._things = new Map();

    /**
     * Tool for moving and resizing rectangles
     *
     * @type {RectangleModificationTool}
     * @private
     */
    this._rectangleModificationTool = new RectangleModificationTool(this._context);

    this._rectangleModificationTool.on('rectangle:update', (rectangle) => {
      const thing = this._things.get(rectangle.id);

      thing.shapes = [
        {
          type: 'rectangle',
          id: rectangle.id,
          topLeft: {
            x: rectangle.bounds.topLeft.x,
            y: rectangle.bounds.topLeft.y,
          },
          bottomRight: {
            x: rectangle.bounds.bottomRight.x,
            y: rectangle.bounds.bottomRight.y,
          },
        },
      ];

      this.emit('thing:update', rectangle.id, thing);
    });

    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._context);

    this._rectangleDrawingTool.on('rectangle:complete', (rectangle) => {
      const thing = {
        shapes: [
          {
            type: 'rectangle',
            id: rectangle.id,
            topLeft: {
              x: rectangle.bounds.topLeft.x,
              y: rectangle.bounds.topLeft.y,
            },
            bottomRight: {
              x: rectangle.bounds.bottomRight.x,
              y: rectangle.bounds.bottomRight.y,
            },
          },
        ],
      };

      // TODO use item-INdependent id since this won't work with multiple shapes per LabeledThingInFrame
      this.setThing(rectangle.id, thing);

      this.emit('thing:new', rectangle.id, thing);
    });
  }

  /**
   * Activates the tool identified by the given name
   *
   * @method ThingLayer#activateTool
   *
   * @param {String} toolName
   */
  activateTool(toolName) {
    switch (toolName) {
      case 'drawing':
        this._rectangleDrawingTool.activate();
        break;
      default:
        this._rectangleModificationTool.activate();
    }
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} annotations
   */
  addThings(annotations) {
    this._context.withScope((scope) => {
      annotations.forEach((annotation) => {
        const shape = annotation.shapes[0];
        const rect = this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, {
          strokeColor: 'red',
          strokeWidth: 2,
          fillColor: new paper.Color(0, 0, 0, 0),
        });

        this._things.set(rect.id, annotation);
      });

      scope.view.update();
    });
  }

  /**
   * Removes all things from the layer
   *
   * @method ThingLayer#clear
   */
  clear() {
    super.clear();
    this._things.clear();
  }

  /**
   * @param {String} id - The id used internally by this layer
   * @param {LabeledThingInFrame} thing
   */
  setThing(id, thing) {
    this._things.set(id, thing);
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}

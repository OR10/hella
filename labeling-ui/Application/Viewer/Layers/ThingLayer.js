import paper from 'paper';

import PaperLayer from './PaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import EllipseDrawingTool from '../Tools/EllipsesDrawingTool';
import PolygonDrawingTool from '../Tools/PolygonDrawingTool';
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
    this._thingsByShapeId = new Map();

    /**
     * Tool for moving and resizing rectangles
     *
     * @type {RectangleModificationTool}
     * @private
     */
    this._rectangleModificationTool = new RectangleModificationTool(this._context, undefined);

    this._rectangleModificationTool.on('rectangle:update', rectangle => {
      const labeledThing = this._thingsByShapeId.get(rectangle.id);

      labeledThing.shapes = [
        {
          type: 'rectangle',
          topLeft: {
            x: Math.round(rectangle.bounds.topLeft.x),
            y: Math.round(rectangle.bounds.topLeft.y),
          },
          bottomRight: {
            x: Math.round(rectangle.bounds.bottomRight.x),
            y: Math.round(rectangle.bounds.bottomRight.y),
          },
        },
      ];

      this.emit('thing:update', labeledThing);
    });

    this._rectangleModificationTool.on('rectangle:selected', rectangle => {
      const labeledThing = this._thingsByShapeId.get(rectangle.id);
      this.emit('thing:selected', labeledThing);
    });

    this._rectangleModificationTool.on('rectangle:deselected', () => {
      this.emit('thing:deselected');
    });

    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._context, undefined);

    this._rectangleDrawingTool.on('rectangle:complete', rectangle => {
      const shapes = [
        {
          type: 'rectangle',
          topLeft: {
            x: Math.round(rectangle.bounds.topLeft.x),
            y: Math.round(rectangle.bounds.topLeft.y),
          },
          bottomRight: {
            x: Math.round(rectangle.bounds.bottomRight.x),
            y: Math.round(rectangle.bounds.bottomRight.y),
          },
        },
      ];

      this.emit('thing:new', shapes);
    });

    this._ellipseDrawingTool = new EllipseDrawingTool(this._context, undefined);

    this._ellipseDrawingTool.on('ellipse:complete', ellipse => {
      const shapes = [
        {
          type: 'ellipse',
          point: {
            x: Math.round(ellipse.getPosition().x),
            y: Math.round(ellipse.getPosition().y),
          },
          size: {
            width: Math.round(ellipse.bounds.width),
            height: Math.round(ellipse.bounds.height),
          },
        },
      ];

      this.emit('thing:new', shapes);
    });

    this._circleDrawingTool = new EllipseDrawingTool(this._context, {circle: true});

    this._circleDrawingTool.on('ellipse:complete', ellipse => {
      const shapes = [
        {
          type: 'ellipse',
          point: {
            x: Math.round(ellipse.getPosition().x),
            y: Math.round(ellipse.getPosition().y),
          },
          size: {
            width: Math.round(ellipse.bounds.width),
            height: Math.round(ellipse.bounds.height),
          },
        },
      ];

      this.emit('thing:new', shapes);
    });

    this._polygonDrawingTool = new PolygonDrawingTool(this._context, {closed: true});

    this._polygonDrawingTool.on('polygon:complete', polygon => {
      const shapes = [
        {
          type: 'polygon',
          points: polygon.getSegments().map((segment) => {
            return {
              x: segment.point.x,
              y: segment.point.y,
            };
          }),
        },
      ];

      console.log(polygon);

      this.emit('thing:new', shapes);
    });

    this._lineDrawingTool = new PolygonDrawingTool(this._context, {line: true});

    this._lineDrawingTool.on('line:complete', polygon => {
      const shapes = [
        {
          type: 'polygon',
          points: polygon.getSegments().map((segment) => {
            return {
              x: segment.point.x,
              y: segment.point.y,
            };
          }),
        },
      ];

      console.log(shapes);

      this.emit('thing:new', shapes);
    });
  }

  /**
   * Activates the tool identified by the given name
   *
   * @param {String} toolName
   */
  activateTool(toolName) {
    switch (toolName) {
      case 'polygon':
        this._polygonDrawingTool.activate();
        break;
      case 'line':
        this._lineDrawingTool.activate();
        break;
      case 'ellipse':
        this._ellipseDrawingTool.activate();
        break;
      case 'circle':
        this._circleDrawingTool.activate();
        break;
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
   * @param {Array<LabeledThingInFrame>} labeledThings
   */
  addLabeledThings(labeledThings) {
    this._context.withScope((scope) => {
      labeledThings.forEach((labeledThing) => {
        const shape = labeledThing.shapes[0];
        const rect = this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, {
          strokeColor: 'red',
          strokeWidth: 2,
          fillColor: new paper.Color(0, 0, 0, 0),
        });

        this._thingsByShapeId.set(rect.id, labeledThing);
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
    this._thingsByShapeId.clear();
  }

  dispatchDOMEvent(event) {
    this._element.dispatchEvent(event);
  }
}

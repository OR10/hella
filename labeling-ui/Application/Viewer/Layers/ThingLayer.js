import paper from 'paper';

import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import RectangleDrawingTool from '../Tools/RectangleDrawingTool';
import EllipseDrawingTool from '../Tools/EllipseDrawingTool';
import CircleDrawingTool from '../Tools/CircleDrawingTool';
import PathDrawingTool from '../Tools/PathDrawingTool';
import PolygonDrawingTool from '../Tools/PolygonDrawingTool';
import LineDrawingTool from '../Tools/LineDrawingTool';
import PointDrawingTool from '../Tools/PointDrawingTool';
import ShapeMoveTool from '../Tools/ShapeMoveTool';

import RectangleRenderer from '../Renderer/RectangleRenderer';
import EllipseRenderer from '../Renderer/EllipseRenderer';
import PathRenderer from '../Renderer/PathRenderer';

/**
 * A Layer used to draw Things within the viewer
 *
 * @class ThingLayer
 * @extends PanAndZoomPaperLayer
 */
export default class ThingLayer extends PanAndZoomPaperLayer {
  /**
   * @param {DrawingContextService} drawingContextService
   */
  constructor(drawingContextService) {
    super(drawingContextService);

    this._selectedLabeledThingInFrame = null;

    /**
     * Renderer used by this layer to draw labeling rectangles loaded from the backend
     *
     * @type {RectangleRenderer}
     * @private
     */
    this._rectangleRenderer = new RectangleRenderer();

    /**
     *
     * @type {EllipseRenderer}
     * @private
     */
    this._ellipseRenderer = new EllipseRenderer();

    /**
     *
     * @type {PathRenderer}
     * @private
     */
    this._pathRenderer = new PathRenderer();

    /**
     * Storage used to manage the currently displayed things
     *
     * @type {Map}
     * @private
     */
    this._thingIdsByShapeId = new Map();

    /**
     * Storage to get the shape type from the shape
     *
     * @type {Map}
     * @private
     */
    this._typeByShapeId = new Map();

    /**
     * Tool for moving shapes
     *
     * @type {ShapeMoveTool}
     * @private
     */
    this._shapeMoveTool = new ShapeMoveTool(this._context, undefined);
    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._context, undefined);
    /**
     * Tool for drawing ellipses
     *
     * @type {EllipseDrawingTool}
     * @private
     */
    this._ellipseDrawingTool = new EllipseDrawingTool(this._context, undefined);
    /**
     * Tool for drawing circles
     *
     * @type {CircleDrawingTool}
     * @private
     */
    this._circleDrawingTool = new CircleDrawingTool(this._context, undefined);
    /**
     * Tool for drawing paths
     *
     * @type {PathDrawingTool}
     * @private
     */
    this._pathDrawingTool = new PathDrawingTool(this._context, undefined);
    /**
     * Tool for drawing closed polygons
     *
     * @type {PolygonDrawingTool}
     * @private
     */
    this._polygonDrawingTool = new PolygonDrawingTool(this._context, undefined);
    /**
     * Tool for drawing lines
     *
     * @type {LineDrawingTool}
     * @private
     */
    this._lineDrawingTool = new LineDrawingTool(this._context, undefined);
    /**
     * Tool for drawing points
     *
     * @type {PointDrawingTool}
     * @private
     */
    this._pointDrawingTool = new PointDrawingTool(this._context, undefined);

    this._shapeMoveTool.on('shape:selected', shape => {
      this.emit('thing:selected', this._thingIdsByShapeId.get(shape.id));
    });

    this._shapeMoveTool.on('shape:deselected', () => {
      this.emit('thing:deselected');
    });

    this._shapeMoveTool.on('shape:update', shape => {
      const transformedShape = this._transformShape(shape);
      this.emit('thing:update', this._thingIdsByShapeId.get(shape.id), transformedShape);
    });

    this._rectangleDrawingTool.on('rectangle:complete', rectangle => {
      const shape = {
        type: 'rectangle',
        topLeft: {
          x: Math.round(rectangle.bounds.topLeft.x),
          y: Math.round(rectangle.bounds.topLeft.y),
        },
        bottomRight: {
          x: Math.round(rectangle.bounds.bottomRight.x),
          y: Math.round(rectangle.bounds.bottomRight.y),
        },
      };

      this._typeByShapeId.set(rectangle.id, 'rectangle');
      this._thingIdsByShapeId.set(rectangle.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._ellipseDrawingTool.on('ellipse:complete', ellipse => {
      const shape = {
        type: 'ellipse',
        point: {
          x: Math.round(ellipse.getPosition().x),
          y: Math.round(ellipse.getPosition().y),
        },
        size: {
          width: Math.round(ellipse.bounds.width),
          height: Math.round(ellipse.bounds.height),
        },
      };

      this._typeByShapeId.set(ellipse.id, 'ellipse');
      this._thingIdsByShapeId.set(ellipse.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._circleDrawingTool.on('ellipse:complete', ellipse => {
      console.log(ellipse.getPosition(), ellipse.position);
      const shape = {
        type: 'circle',
        point: {
          x: Math.round(ellipse.getPosition().x),
          y: Math.round(ellipse.getPosition().y),
        },
        size: {
          width: Math.round(ellipse.bounds.width),
          height: Math.round(ellipse.bounds.height),
        },
      };

      this._typeByShapeId.set(ellipse.id, 'circle');
      this._thingIdsByShapeId.set(ellipse.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._pathDrawingTool.on('path:complete', polygon => {
      const shape = {
        type: 'path',
        points: polygon.getSegments().map((segment) => {
          return {
            x: segment.point.x,
            y: segment.point.y,
          };
        }),
        closed: true,
      };

      this._typeByShapeId.set(polygon.id, 'path');
      this._thingIdsByShapeId.set(polygon.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._polygonDrawingTool.on('path:complete', polygon => {
      const shape = {
        type: 'polygon',
        points: polygon.getSegments().map((segment) => {
          return {
            x: segment.point.x,
            y: segment.point.y,
          };
        }),
      };

      this._typeByShapeId.set(polygon.id, 'polygon');
      this._thingIdsByShapeId.set(polygon.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._lineDrawingTool.on('path:complete', polygon => {
      const shape = {
        type: 'line',
        points: polygon.getSegments().map((segment) => {
          return {
            x: segment.point.x,
            y: segment.point.y,
          };
        }),
      };

      this._typeByShapeId.set(polygon.id, 'line');
      this._thingIdsByShapeId.set(polygon.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });

    this._pointDrawingTool.on('point:complete', polygon => {
      const shape = [
        {
          type: 'point',
          point: {
            x: polygon.getPosition().x,
            y: polygon.getPosition().y,
          },
        },
      ];

      this._typeByShapeId.set(polygon.id, 'point');
      this._thingIdsByShapeId.set(polygon.id, this._selectedLabeledThingInFrame.id);
      this.emit('thing:new', shape);
    });
  }

  /**
   * Activates the tool identified by the given name
   *
   * @param {String} toolName
   */
  activateTool(toolName) {
    switch (toolName) {
      case 'rectangle':
        this._rectangleDrawingTool.activate();
        break;
      case 'ellipse':
        this._ellipseDrawingTool.activate();
        break;
      case 'circle':
        this._circleDrawingTool.activate();
        break;
      case 'path':
        this._pathDrawingTool.activate();
        break;
      case 'polygon':
        this._polygonDrawingTool.activate();
        break;
      case 'line':
        this._lineDrawingTool.activate();
        break;
      case 'point':
        this._pointDrawingTool.activate();
        break;
      case 'move':
      default:
        this._shapeMoveTool.activate();
    }
  }

  setSelectedLabeledThingInFrame(thing){
    this._selectedLabeledThingInFrame = thing;
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} labeledThings
   */
  addLabeledThings(labeledThings) {
    this._context.withScope((scope) => {
      labeledThings.forEach((labeledThing) => {
        labeledThing.shapes.forEach(shape => {
          const shapeId = this._drawShape(shape);
          this._thingIdsByShapeId.set(shapeId, labeledThing.id);
          this._typeByShapeId.set(shapeId, shape.type);
        });
      });

      scope.view.update();
    });
  }

  _drawShape(shape) {
    const shapeFillOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
    };
    const shapeOptions = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeScaling: false,
    };

    switch (shape.type) {
      case 'rectangle':
        const rect = this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, shapeFillOptions);
        return rect.id;
      case 'ellipse':
        const ellipse = this._ellipseRenderer.drawEllipse(shape.point, shape.size, shapeFillOptions);
        return ellipse.id;
      case 'circle':
        const circle = this._ellipseRenderer.drawCircle(shape.point, shape.size.width / 2, shapeFillOptions);
        return circle.id;
      case 'path':
        const path = this._pathRenderer.drawPath(shape.points, shapeOptions);
        return path.id;
      case 'polygon':
        const polygon = this._pathRenderer.drawPolygon(shape.points, shapeFillOptions);
        return polygon.id;
      case 'line':
        const line = this._pathRenderer.drawLine(shape.points[0], shape.segments[1], shapeOptions);
        return line.id;
      case 'point':
        const point = this._ellipseRenderer.drawCircle(shape.point, 1, shapeFillOptions);
        return point.id;
      default:
        throw new Error(`Could not draw shape of unknown type "${shape.type}"`);
    }
  }

  /**
   * Updates the labeledThing object based on the object type
   *
   * @param {string} labeledThingId
   * @param {Object} shape
   * @returns {LabeledThing}
   * @private
   */
  _transformShape(shape) {
    const type = this._typeByShapeId.get(shape.id);
    let transformedShape = {};
    switch (type) {
      case 'rectangle':
        transformedShape = {
          topLeft: {
            x: Math.round(shape.bounds.x),
            y: Math.round(shape.bounds.y),
          },
          bottomRight: {
            x: Math.round(shape.bounds.x + shape.bounds.width),
            y: Math.round(shape.bounds.y + shape.bounds.height),
          },
        };
        break;
      case 'ellipse':
        transformedShape = {
          point: {
            x: Math.round(shape.position.x),
            y: Math.round(shape.position.y),
          },
          size: {
            width: Math.round(shape.bounds.width),
            height: Math.round(shape.bounds.height),
          },
        };
        break;
      case 'circle':
        console.log(shape.position);
        transformedShape = {
          point: {
            x: Math.round(shape.position.x),
            y: Math.round(shape.position.y),
          },
          size: {
            width: Math.round(shape.bounds.width),
            height: Math.round(shape.bounds.height),
          },
        };
        break;
      case 'path':
        transformedShape = {
          points: [],
        };
        transformedShape.points = shape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'polygon':
        transformedShape = {
          points: [],
        };
        transformedShape.points = shape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'line':
        transformedShape = {
          points: [],
        };
        transformedShape.points = shape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'point':
        transformedShape = {
          point: {
            x: Math.round(shape.getPosition().x),
            y: Math.round(shape.getPosition().y),
          },
        };
        break;
      default:
        throw new Error(`Could not update shape of unknown type "${type}"`);
    }
    transformedShape.id = shape.id;
    transformedShape.type = type;
    return transformedShape;
  }

  /**
   * Removes all things from the layer
   *
   * @method ThingLayer#clear
   */
  clear() {
    super.clear();
    this._thingIdsByShapeId.clear();
  }
}

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

//import PaperRectangle from '../Renderer/Shapes/PaperRectangle';

/**
 * A Layer used to draw Things within the viewer
 *
 * @extends PanAndZoomPaperLayer
 */
class ThingLayer extends PanAndZoomPaperLayer {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   */
  constructor($scope, drawingContextService) {
    super($scope, drawingContextService);

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
     * Storage to get the shape type from the shape
     *
     * @type {Map}
     * @private
     */
    this._typeByPaperShapeId = new Map();

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
      $scope.$apply(() => {
        $scope.vm.selectedShape = shape;
      });
    });

    this._shapeMoveTool.on('shape:deselected', () => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = null;
      });
    });

    this._shapeMoveTool.on('shape:update', shape => {
      const transformedShape = this._transformShape(shape);
      this.emit('thing:update', transformedShape);
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

      this._typeByPaperShapeId.set(rectangle.id, 'rectangle');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

      this._typeByPaperShapeId.set(ellipse.id, 'ellipse');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
    });

    this._circleDrawingTool.on('ellipse:complete', ellipse => {
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

      this._typeByPaperShapeId.set(ellipse.id, 'circle');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

      this._typeByPaperShapeId.set(polygon.id, 'path');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

      this._typeByPaperShapeId.set(polygon.id, 'polygon');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

      this._typeByPaperShapeId.set(polygon.id, 'line');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

      this._typeByPaperShapeId.set(polygon.id, 'point');
      shape.labeledThingInFrameId = this._selectedLabeledThingInFrame.id;
      this.emit('shape:new', shape);
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

  setSelectedLabeledThingInFrame(thing) {
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
          this._typeByPaperShapeId.set(shapeId, shape.type);
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

    // @TODO: Should be refactored to be handled inside the Renderer 'supportsShape(...)' -> (Open/Close Principle)
    // @TODO: Should be refactored be use custom Shapes inheriting the Paper.Shape classes, which can then handle the
    //        creation from out data structures as well as the serialization into them
    //        I have tried something like this in the Renderer/Shape/PaperRectangle. It works, but uses an evil hack for
    //        realizing the inheritance from Paper. I am not sure we want this. Maybe we want to discuss wrapping all our
    //        paper objects here instead.
    switch (shape.type) {
      case 'rectangle':
        const rect = this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, shapeFillOptions);
        //const rect = new PaperRectangle(shape, shapeFillOptions);
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
   * @param {Paper.Shape} paperShape
   * @returns {Shape}
   * @private
   */
  _transformShape(paperShape) {
    const type = this._typeByPaperShapeId.get(paperShape.id);
    let newShape = {};
    switch (type) {
      case 'rectangle':
        newShape = {
          topLeft: {
            x: Math.round(paperShape.bounds.x),
            y: Math.round(paperShape.bounds.y),
          },
          bottomRight: {
            x: Math.round(paperShape.bounds.x + paperShape.bounds.width),
            y: Math.round(paperShape.bounds.y + paperShape.bounds.height),
          },
        };
        break;
      case 'ellipse':
        newShape = {
          point: {
            x: Math.round(paperShape.position.x),
            y: Math.round(paperShape.position.y),
          },
          size: {
            width: Math.round(paperShape.bounds.width),
            height: Math.round(paperShape.bounds.height),
          },
        };
        break;
      case 'circle':
        newShape = {
          point: {
            x: Math.round(paperShape.position.x),
            y: Math.round(paperShape.position.y),
          },
          size: {
            width: Math.round(paperShape.bounds.width),
            height: Math.round(paperShape.bounds.height),
          },
        };
        break;
      case 'path':
        newShape = {
          points: [],
        };
        newShape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'polygon':
        newShape = {
          points: [],
        };
        newShape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'line':
        newShape = {
          points: [],
        };
        newShape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'point':
        newShape = {
          point: {
            x: Math.round(paperShape.getPosition().x),
            y: Math.round(paperShape.getPosition().y),
          },
        };
        break;
      default:
        throw new Error(`Could not update shape of unknown type "${type}"`);
    }

    newShape.type = type;
    return newShape;
  }

  /**
   * Removes all things from the layer
   *
   * @method ThingLayer#clear
   */
  clear() {
    super.clear();
  }
}

export default ThingLayer;

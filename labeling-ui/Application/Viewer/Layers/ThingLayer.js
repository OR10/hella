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
import ShapeScaleTool from '../Tools/ShapeScaleTool';

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
     * Storage to get the shape type from the paper shape by id
     *
     * @type {Map}
     * @private
     */
    this._typeByPaperShapeId = new Map();

    /**
     * Storage to get the labeledThingInFrameId from paper shape by id
     *
     * @type {Map}
     * @private
     */
    this._labeledThingInFrameIdByPaperShapeId = new Map();

    /**
     * Tool for moving shapes
     *
     * @type {ShapeMoveTool}
     * @private
     */
    this._shapeMoveTool = new ShapeMoveTool(this._context, undefined);

    /**
     * Tool for scaling shapes
     *
     * @type {ShapeScaleTool}
     * @private
     */
    this._shapeScaleTool = new ShapeScaleTool(this._context, undefined);
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

    $scope.$watch('vm.ghostedLabeledThingInFrame', labeledThingInFrame => {
      if (labeledThingInFrame === null) {
        // @TODO: Remove old ghost here
        return;
      }

      const paperShapes = this.addLabeledThingInFrame(labeledThingInFrame, false);
      $scope.vm.activeTool = 'move';
      this._shapeMoveTool.selectShape(paperShapes[0]);

      this._context.withScope(scope => {
        scope.view.draw();
      })
    });

    this._shapeMoveTool.on('shape:selected', paperShape => {
      const type = this._typeByPaperShapeId.get(paperShape.id);
      const shape = this._createShapeFromPaperShape(paperShape, type);

      $scope.$apply(() => {
        $scope.vm.selectedShape = {paperShape, shape};
      });
    });

    this._shapeMoveTool.on('shape:deselected', () => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = null;
      });
    });

    this._shapeMoveTool.on('shape:update', paperShape => {
      const type = this._typeByPaperShapeId.get(paperShape.id);
      const shape = this._createShapeFromPaperShape(paperShape, type);
      this.emit('shape:update', shape);
    });


    this._shapeScaleTool.on('shape:selected', paperShape => {
      const type = this._typeByPaperShapeId.get(paperShape.id);
      const shape = this._createShapeFromPaperShape(paperShape, type);

      $scope.$apply(() => {
        $scope.vm.selectedShape = shape;
      });
    });

    this._shapeScaleTool.on('shape:deselected', () => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = null;
      });
    });

    this._shapeScaleTool.on('shape:update', paperShape => {
      const type = this._typeByPaperShapeId.get(paperShape.id);
      const shape = this._createShapeFromPaperShape(paperShape, type);
      this.emit('shape:update', shape);
    });


    this._rectangleDrawingTool.on('rectangle:complete', rectangle => {
      this._typeByPaperShapeId.set(rectangle.id, 'rectangle');
      this._labeledThingInFrameIdByPaperShapeId.set(rectangle.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(rectangle, 'rectangle');
      this.emit('shape:new', shape);
    });

    this._ellipseDrawingTool.on('ellipse:complete', ellipse => {
      this._typeByPaperShapeId.set(ellipse.id, 'ellipse');
      this._labeledThingInFrameIdByPaperShapeId.set(ellipse.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(ellipse, 'ellipse');
      this.emit('shape:new', shape);
    });

    this._circleDrawingTool.on('ellipse:complete', circle => {
      this._typeByPaperShapeId.set(circle.id, 'circle');
      this._labeledThingInFrameIdByPaperShapeId.set(circle.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(circle, 'circle');
      this.emit('shape:new', shape);
    });

    this._pathDrawingTool.on('path:complete', path => {
      this._typeByPaperShapeId.set(path.id, 'path');
      this._labeledThingInFrameIdByPaperShapeId.set(path.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(path, 'path');
      this.emit('shape:new', shape);
    });

    this._polygonDrawingTool.on('path:complete', polygon => {
      this._typeByPaperShapeId.set(polygon.id, 'polygon');
      this._labeledThingInFrameIdByPaperShapeId.set(polygon.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(polygon, 'polygon');
      this.emit('shape:new', shape);
    });

    this._lineDrawingTool.on('path:complete', line => {
      this._typeByPaperShapeId.set(line.id, 'line');
      this._labeledThingInFrameIdByPaperShapeId.set(line.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(line, 'line');
      this.emit('shape:new', shape);
    });

    this._pointDrawingTool.on('point:complete', point => {
      this._typeByPaperShapeId.set(point.id, 'point');
      this._labeledThingInFrameIdByPaperShapeId.set(point.id, this._$scope.selectedLabeledThingInFrame.id);
      const shape = this._createShapeFromPaperShape(point, 'point');
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
      case 'scale':
        this._shapeScaleTool.activate();
        break;
      case 'move':
      default:
        this._shapeMoveTool.activate();
    }
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} labeledThingsInFrame
   */
  addLabeledThingsInFrame(labeledThingsInFrame) {
    labeledThingsInFrame.forEach((labeledThingInFrame) => {
      this.addLabeledThingInFrame(labeledThingInFrame, false);
    });

    this._context.withScope((scope) => {
      scope.view.update();
    });
  }

  /**
   * Add a single {@link LabeledThingInFrame} to the layer
   *
   * Optionally it may be specified if the view should be updated after adding the new shapes
   * By default it will be rerendered.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {boolean?} update
   * @return {Array.<paper.Shape>}
   */
  addLabeledThingInFrame(labeledThingInFrame, update = true) {
     const paperShapes = labeledThingInFrame.shapes.map(shape => {
       if (!shape.labeledThingInFrameId) {
         shape.labeledThingInFrameId = labeledThingInFrame.id;
       }
       return this._addShape(shape, false);
    });

    if (update) {
      this._context.withScope((scope) => {
        scope.view.update();
      });
    }

    return paperShapes;
  }

  /**
   * Add a specific {@link Shape} to the layer
   *
   * Optionally it may be specified if the view should be updated after adding the new shapes
   * By default it will be rerendered.
   *
   * @param {Shape} shape
   * @param {boolean?} update
   * @return {paper.Shape}
   */
  _addShape(shape, update = true) {
    const paperShape = this._drawShape(shape);

    this._typeByPaperShapeId.set(paperShape.id, shape.type);
    this._labeledThingInFrameIdByPaperShapeId.set(paperShape.id, shape.labeledThingInFrameId);

    if (update) {
      this._context.withScope((scope) => {
        scope.view.update();
      });
    }

    return paperShape;
  }

  /**
   * Draw a given {@link Shape} to the Layer
   *
   * The drawn Paper Shape will be returned
   *
   * @param {Shape} shape
   * @returns {paper.Shape}
   * @private
   */
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

    return this._context.withScope(scope => {
      // @TODO: Should be refactored to be handled inside the Renderer 'supportsShape(...)' -> (Open/Close Principle)
      switch (shape.type) {
        case 'rectangle':
          return this._rectangleRenderer.drawRectangle(shape.topLeft, shape.bottomRight, shapeFillOptions);
        case 'ellipse':
          return this._ellipseRenderer.drawEllipse(shape.point, shape.size, shapeFillOptions);
        case 'circle':
          return this._ellipseRenderer.drawCircle(shape.point, shape.size.width / 2, shapeFillOptions);
        case 'path':
          return this._pathRenderer.drawPath(shape.points, shapeOptions);
        case 'polygon':
          return this._pathRenderer.drawPolygon(shape.points, shapeFillOptions);
        case 'line':
          return this._pathRenderer.drawLine(shape.points[0], shape.segments[1], shapeOptions);
        case 'point':
          return this._ellipseRenderer.drawCircle(shape.point, 1, shapeFillOptions);
        default:
          throw new Error(`Could not draw shape of unknown type "${shape.type}"`);
      }
    });
  }

  /**
   * @param {paper.Shape} paperShape
   * @param type
   * @return {Shape}
   * @private
   */
  _createShapeFromPaperShape(paperShape, type) {
    let shape = {};
    switch (type) {
      case 'rectangle':
        shape = {
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
        shape = {
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
        shape = {
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
        shape = {
          points: [],
        };
        shape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'polygon':
        shape = {
          points: [],
        };
        shape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'line':
        shape = {
          points: [],
        };
        shape.points = paperShape.segments.map((segment) => {
          return {
            x: Math.round(segment.point.x),
            y: Math.round(segment.point.y),
          };
        });
        break;
      case 'point':
        shape = {
          point: {
            x: Math.round(paperShape.getPosition().x),
            y: Math.round(paperShape.getPosition().y),
          },
        };
        break;
      default:
        throw new Error(`Could not create shape of unknown type "${type}"`);
    }
    shape.type = type;

    if (this._labeledThingInFrameIdByPaperShapeId.has(paperShape.id)) {
      shape.labeledThingInFrameId = this._labeledThingInFrameIdByPaperShapeId.get(paperShape.id);
    }

    return shape;
  }

  /**
   * Removes all things from the layer
   *
   * @method ThingLayer#clear
   */
  clear() {
    super.clear();
    this._typeByPaperShapeId.clear();
    this._labeledThingInFrameIdByPaperShapeId.clear();
  }
}

export default ThingLayer;

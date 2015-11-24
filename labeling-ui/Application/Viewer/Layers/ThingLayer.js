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

import ShapeFactory from '../Shapes/ShapeFactory';

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
     * @type {Map}
     * @private
     */
    this._paperShapeByLabeledThingInFrameId = new Map();

    /**
     * @type {ShapeFactory}
     * @private
     */
    this._shapeFactory = new ShapeFactory($scope);

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
    this._shapeScaleTool = new ShapeScaleTool(this._context, undefined, this._typeByPaperShapeId);
    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._shapeFactory, this._context, undefined);

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

    $scope.$watch('vm.ghostedLabeledThingInFrame', (labeledThingInFrame, oldLabeledThingInFrame) => {
      if (labeledThingInFrame === null) {
        if (oldLabeledThingInFrame !== null) {
          // Remove ghost if it is no longer needed
          const oldGhostPaperShape = this._paperShapeByLabeledThingInFrameId.get(oldLabeledThingInFrame.id);
          if (oldGhostPaperShape) {
            // @TODO: I am not 100% sure, why this can happen. Should be fixed at its root cause
            oldGhostPaperShape.remove();
          }

          this._context.withScope(scope => {
            scope.view.draw();
          });
        }

        return;
      }

      const paperShapes = this.addLabeledThingInFrame(labeledThingInFrame, false);
      $scope.vm.activeTool = 'move';
      //this._shapeMoveTool.selectShape(paperShapes[0]);

      this._context.withScope(scope => {
        scope.view.draw();
      });
    });

    $scope.$watchCollection('vm.labeledThingsInFrame', (newLabeledThingsInFrame, oldLabeledThingsInFrame) => {
      if (newLabeledThingsInFrame === null) {
        this.clear();
        return;
      }

      const addedLabeledThingsInFrame = Object.values(newLabeledThingsInFrame)
        .filter(
          newLabeledThingInFrame => oldLabeledThingsInFrame === null || oldLabeledThingsInFrame[newLabeledThingInFrame.id] === undefined
        );

      this.addLabeledThingsInFrame(addedLabeledThingsInFrame);
    });

    this._shapeMoveTool.on('shape:selected', paperShape => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = {paperShape, shape};
      });
    });

    this._shapeMoveTool.on('shape:deselected', () => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = null;
      });
    });


    this._shapeScaleTool.on('shape:selected', paperShape => {
      const type = this._typeByPaperShapeId.get(paperShape.id);
      const shape = rectangle._$scope.vm.shape;

      $scope.$apply(() => {
        $scope.vm.selectedShape = shape;
      });
    });

    this._shapeScaleTool.on('shape:deselected', () => {
      $scope.$apply(() => {
        $scope.vm.selectedShape = null;
      });
    });

    //this._shapeScaleTool.on('shape:update', paperShape => {
    //  const type = this._typeByPaperShapeId.get(paperShape.id);
    //  const shape = this._createShapeFromPaperShape(paperShape, type);
    //  this.emit('shape:update', shape);
    //});


    this._rectangleDrawingTool.on('rectangle:complete', rectangle => {
      this._typeByPaperShapeId.set(rectangle.id, 'rectangle');
      this._labeledThingInFrameIdByPaperShapeId.set(rectangle.id, this._$scope.vm.selectedLabeledThingInFrame.id);
      this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, rectangle);
      this.emit('shape:new', rectangle._$scope.vm.shape);
    });

    //this._ellipseDrawingTool.on('ellipse:complete', ellipse => {
    //  this._typeByPaperShapeId.set(ellipse.id, 'ellipse');
    //  this._labeledThingInFrameIdByPaperShapeId.set(ellipse.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, ellipse);
    //  const shape = this._createShapeFromPaperShape(ellipse, 'ellipse');
    //  this.emit('shape:new', shape);
    //});
    //
    //this._circleDrawingTool.on('ellipse:complete', circle => {
    //  this._typeByPaperShapeId.set(circle.id, 'circle');
    //  this._labeledThingInFrameIdByPaperShapeId.set(circle.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, circle);
    //  const shape = this._createShapeFromPaperShape(circle, 'circle');
    //  this.emit('shape:new', shape);
    //});
    //
    //this._pathDrawingTool.on('path:complete', path => {
    //  this._typeByPaperShapeId.set(path.id, 'path');
    //  this._labeledThingInFrameIdByPaperShapeId.set(path.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, path);
    //  const shape = this._createShapeFromPaperShape(path, 'path');
    //  this.emit('shape:new', shape);
    //});
    //
    //this._polygonDrawingTool.on('path:complete', polygon => {
    //  this._typeByPaperShapeId.set(polygon.id, 'polygon');
    //  this._labeledThingInFrameIdByPaperShapeId.set(polygon.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, polygon);
    //  const shape = this._createShapeFromPaperShape(polygon, 'polygon');
    //  this.emit('shape:new', shape);
    //});
    //
    //this._lineDrawingTool.on('path:complete', line => {
    //  this._typeByPaperShapeId.set(line.id, 'line');
    //  this._labeledThingInFrameIdByPaperShapeId.set(line.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, line);
    //  const shape = this._createShapeFromPaperShape(line, 'line');
    //  this.emit('shape:new', shape);
    //});
    //
    //this._pointDrawingTool.on('point:complete', point => {
    //  this._typeByPaperShapeId.set(point.id, 'point');
    //  this._labeledThingInFrameIdByPaperShapeId.set(point.id, this._$scope.vm.selectedLabeledThingInFrame.id);
    //  this._paperShapeByLabeledThingInFrameId.set(this._$scope.vm.selectedLabeledThingInFrame.id, point);
    //  const shape = this._createShapeFromPaperShape(point, 'point');
    //  this.emit('shape:new', shape);
    //});
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
      let selectedLabeledThingId = null;
      if (this._$scope.vm.selectedLabeledThingInFrame) {
        selectedLabeledThingId = this._$scope.vm.selectedLabeledThingInFrame.labeledThingId;
      }

      const selected = labeledThingInFrame.labeledThingId === selectedLabeledThingId;

      if (!shape.labeledThingInFrameId) {
        shape.labeledThingInFrameId = labeledThingInFrame.id;
      }

      return this._addShape(shape, false, selected);
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
   * @param {boolean?} selected
   * @return {paper.Shape}
   */
  _addShape(shape, update = true, selected = false) {
    const paperShape = this._drawShape(shape, selected);

    this._typeByPaperShapeId.set(paperShape.id, shape.type);
    this._labeledThingInFrameIdByPaperShapeId.set(paperShape.id, shape.labeledThingInFrameId);
    this._paperShapeByLabeledThingInFrameId.set(shape.labeledThingInFrameId, paperShape);

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
   * @param {boolean} selected
   * @returns {paper.Shape}
   * @private
   */
  _drawShape(shape, selected = false) {
    return this._context.withScope(() => {
      let paperShape = null;
      // @TODO: Should be refactored to be handled inside the Renderer 'supportsShape(...)' -> (Open/Close Principle)
      switch (shape.type) {
        case 'rectangle':
          paperShape = this._shapeFactory.createRectangle({shape, selected, color: 'red'});
          break;
        default:
          throw new Error(`Could not draw shape of unknown type "${shape.type}"`);
      }
      return paperShape;
    });
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
    this._paperShapeByLabeledThingInFrameId.clear();
  }
}

export default ThingLayer;

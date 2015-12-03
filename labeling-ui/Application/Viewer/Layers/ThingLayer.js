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

import PaperShape from '../Shapes/PaperShape';

/**
 * A Layer used to draw Things within the viewer
 *
 * @extends PanAndZoomPaperLayer
 */
class ThingLayer extends PanAndZoomPaperLayer {
  /**
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   * @param {EntityIdService} entityIdService
   * @param {PaperShapeFactory} paperShapeFactory
   */
  constructor($scope, drawingContextService, entityIdService, paperShapeFactory) {
    super($scope, drawingContextService);

    /**
     * @type {PaperShapeFactory}
     * @private
     */
    this._paperShapeFactory = paperShapeFactory;

    /**
     * Tool for moving shapes
     *
     * @type {ShapeMoveTool}
     * @private
     */
    this._shapeMoveTool = new ShapeMoveTool(this._context);

    /**
     * Tool for scaling shapes
     *
     * @type {ShapeScaleTool}
     * @private
     */
    this._shapeScaleTool = new ShapeScaleTool(this._context);

    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._$scope.$new(), this._context, entityIdService);

    ///**
    // * Tool for drawing ellipses
    // *
    // * @type {EllipseDrawingTool}
    // * @private
    // */
    //this._ellipseDrawingTool = new EllipseDrawingTool(this._$scope.$new(), this._context);
    //
    ///**
    // * Tool for drawing circles
    // *
    // * @type {CircleDrawingTool}
    // * @private
    // */
    //this._circleDrawingTool = new CircleDrawingTool(this._$scope.$new(), this._context);
    //
    ///**
    // * Tool for drawing paths
    // *
    // * @type {PathDrawingTool}
    // * @private
    // */
    //this._pathDrawingTool = new PathDrawingTool(this._$scope.$new(), this._context);
    //
    ///**
    // * Tool for drawing closed polygons
    // *
    // * @type {PolygonDrawingTool}
    // * @private
    // */
    //this._polygonDrawingTool = new PolygonDrawingTool(this._$scope.$new(), this._context);
    //
    ///**
    // * Tool for drawing lines
    // *
    // * @type {LineDrawingTool}
    // * @private
    // */
    //this._lineDrawingTool = new LineDrawingTool(this._$scope.$new(), this._context);
    //
    ///**
    // * Tool for drawing points
    // *
    // * @type {PointDrawingTool}
    // * @private
    // */
    //this._pointDrawingTool = new PointDrawingTool(this._$scope.$new(), this._context);

    //$scope.$watch('vm.ghostedLabeledThingInFrame', (labeledThingInFrame, oldLabeledThingInFrame) => {
    //  if (labeledThingInFrame === null) {
    //    if (oldLabeledThingInFrame !== null) {
    //      // Remove ghost if it is no longer needed
    //      const oldGhostPaperShape = this._paperShapeByLabeledThingInFrameId.get(oldLabeledThingInFrame.id);
    //      if (oldGhostPaperShape) {
    //        // @TODO: I am not 100% sure, why this can happen. Should be fixed at its root cause
    //        oldGhostPaperShape.remove();
    //      }
    //
    //      this._context.withScope(scope => {
    //        scope.view.draw();
    //      });
    //    }
    //
    //    return;
    //  }
    //
    //  const paperShapes = this.addLabeledThingInFrame(labeledThingInFrame, false);
    //  $scope.vm.activeTool = 'move';
    //  paperShapes[0].select();
    //  $scope.vm.selectedShape = paperShapes[0];
    //
    //  this._context.withScope(scope => {
    //    scope.view.draw();
    //  });
    //});

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

    $scope.$watch('vm.selectedPaperShape', (newShape, oldShape) => {
      if (oldShape !== null) {
        console.log('deselect shape: ', oldShape.id);
        oldShape.deselect();
      }

      if (newShape) {
        console.log('select shape: ', newShape.id);
        newShape.select();
      }
    });

    this._shapeMoveTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    this._shapeScaleTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    this._rectangleDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._ellipseDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._circleDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._pointDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._pathDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._polygonDrawingTool.on('shape:new', this._onNewShape.bind(this));
    //this._lineDrawingTool.on('shape:new', this._onNewShape.bind(this));
  }

  _onLayerClick(event) {
    this._context.withScope(scope => {
      const projectPoint = scope.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));

      const hitResult = scope.project.hitTest(projectPoint, {
        class: PaperShape,
        fill: true,
        bounds: true,
      });

      if (hitResult) {
        this._$scope.$apply(() => {
          this._$scope.vm.selectedPaperShape = hitResult.item;
        });
      } else {
        this._$scope.$apply(() => {
          this._$scope.vm.selectedPaperShape = null;
        });
      }
    });
  }

  _onNewShape(shape) {
    this._$scope.$apply(() => {
      this._$scope.vm.selectedPaperShape = shape;
    });
    this.emit('shape:new', shape);
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
      //case 'ellipse':
      //  this._ellipseDrawingTool.activate();
      //  break;
      //case 'circle':
      //  this._circleDrawingTool.activate();
      //  break;
      //case 'path':
      //  this._pathDrawingTool.activate();
      //  break;
      //case 'polygon':
      //  this._polygonDrawingTool.activate();
      //  break;
      //case 'line':
      //  this._lineDrawingTool.activate();
      //  break;
      //case 'point':
      //  this._pointDrawingTool.activate();
      //  break;
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
      //if (this._$scope.vm.selectedPaperShape) {
      //  selectedLabeledThingId = this._$scope.vm.selectedPaperShape.labeledThingInFrame.labeledThing.id;
      //}
      //
      //const selected = labeledThingInFrame.labeledThing.id === selectedLabeledThingId;
      const selected = false;

      return this._addShape(labeledThingInFrame, shape, selected, false);
    });

    if (update) {
      this._context.withScope((scope) => {
        scope.view.update();
      });
    }

    return paperShapes;
  }

  /**
   * Draw a given {@link Shape} to the Layer
   *
   * The drawn Paper Shape will be returned
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Shape} shape
   * @param {boolean} selected
   * @param {boolean?} update
   * @returns {paper.Shape}
   * @private
   */
  _addShape(labeledThingInFrame, shape, selected = false, update = true) {
    return this._context.withScope(() => {
      const paperShape = this._paperShapeFactory.createPaperShape(labeledThingInFrame, shape);

      if (selected) {
        paperShape.select();
        this._$scope.vm.selectedPaperShape = paperShape;
      }

      if (update) {
        this._context.withScope((scope) => {
          scope.view.update();
        });
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
  }

  attachToDom(element) {
    super.attachToDom(element);

    element.addEventListener('mousedown', this._onLayerClick.bind(this));
  }
}

export default ThingLayer;

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
import ZoomTool from '../Tools/ZoomTool';
import MultiTool from '../Tools/MultiTool';

import PaperShape from '../Shapes/PaperShape';

/**
 * A Layer used to draw Things within the viewer
 *
 * @extends PanAndZoomPaperLayer
 */
class ThingLayer extends PanAndZoomPaperLayer {
  /**
   * @param {int} width
   * @param {int} height
   * @param {$rootScope.Scope} $scope
   * @param {DrawingContextService} drawingContextService
   * @param {EntityIdService} entityIdService
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {EntityColorService} entityColorService
   * @param {LoggerService} logger
   * @param {$timeout} $timeout
   */
  constructor(width, height, $scope, drawingContextService, entityIdService, paperShapeFactory, entityColorService, logger, $timeout) {
    super(width, height, $scope, drawingContextService);

    /**
     * @type {PaperShapeFactory}
     * @private
     */
    this._paperShapeFactory = paperShapeFactory;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * Tool for moving shapes
     *
     * @type {ShapeMoveTool}
     * @private
     */
    this._multiTool = new MultiTool($scope.$new(), this._context);

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
     * @type {null}
     * @private
     */
    this._zoomInTool = new ZoomTool(ZoomTool.ZOOM_IN, $scope.$new(), this._context);

    /**
     * @type {null}
     * @private
     */
    this._zoomOutTool = new ZoomTool(ZoomTool.ZOOM_OUT, $scope.$new(), this._context);

    /**
     * Tool for drawing rectangles
     *
     * @type {RectangleDrawingTool}
     * @private
     */
    this._rectangleDrawingTool = new RectangleDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);
    $scope.vm.newShapeDrawingTool = this._rectangleDrawingTool;

    /**
     * Tool for drawing ellipses
     *
     * @type {EllipseDrawingTool}
     * @private
     */
    this._ellipseDrawingTool = new EllipseDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Tool for drawing circles
     *
     * @type {CircleDrawingTool}
     * @private
     */
    this._circleDrawingTool = new CircleDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Tool for drawing paths
     *
     * @type {PathDrawingTool}
     * @private
     */
    this._pathDrawingTool = new PathDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Tool for drawing closed polygons
     *
     * @type {PolygonDrawingTool}
     * @private
     */
    this._polygonDrawingTool = new PolygonDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Tool for drawing lines
     *
     * @type {LineDrawingTool}
     * @private
     */
    this._lineDrawingTool = new LineDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Tool for drawing points
     *
     * @type {PointDrawingTool}
     * @private
     */
    this._pointDrawingTool = new PointDrawingTool(this._$scope.$new(), this._context, entityIdService, entityColorService);

    /**
     * Register tool to the MultiTool
     */
    this._multiTool.registerMoveTool(this._shapeMoveTool);
    this._multiTool.registerScaleTool(this._shapeScaleTool);
    this._multiTool.registerCreateTool(this._rectangleDrawingTool);

    $scope.$watchCollection('vm.labeledThingsInFrame', (newLabeledThingsInFrame, oldLabeledThingsInFrame) => {
      const oldSet = new Set(oldLabeledThingsInFrame);
      const newSet = new Set(newLabeledThingsInFrame);

      const addedLabeledThingsInFrame = newLabeledThingsInFrame.filter(item => !oldSet.has(item));
      const removedLabeledThingsInFrame = oldLabeledThingsInFrame.filter(item => !newSet.has(item));

      this.addLabeledThingsInFrame(addedLabeledThingsInFrame, false);
      this.removeLabeledThingsInFrame(removedLabeledThingsInFrame, false);

      this._applyHiddenLabeledThingsInFrameFilter();
    });

    $scope.$watch('vm.hideLabeledThingsInFrame', () => {
      this._applyHiddenLabeledThingsInFrameFilter();
    });

    $scope.$watch('vm.selectedPaperShape', (newShape, oldShape) => {
      if (oldShape !== null) {
        oldShape.deselect();

        // Remove a Ghost upon deselection
        const oldLabeledThingInFrame = oldShape.labeledThingInFrame;
        if (oldLabeledThingInFrame.ghost === true) {
          const index = this._$scope.vm.labeledThingsInFrame.indexOf(oldLabeledThingInFrame);
          if (index !== -1) {
            this._$scope.vm.labeledThingsInFrame.splice(index, 1);
          }
        }
      }

      if (newShape) {
        newShape.select();
      } else {
        // If shape is deselected in hidden LabeledThingInFrame mode switch it off
        if (this._$scope.vm.hideLabeledThingsInFrame) {
          this._$scope.vm.hideLabeledThingsInFrame = false;
        }
      }

      this._applyHiddenLabeledThingsInFrameFilter();
    });

    this._shapeMoveTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    this._shapeScaleTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    this._rectangleDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._ellipseDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._circleDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._pointDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._pathDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._polygonDrawingTool.on('shape:new', this._onNewShape.bind(this));
    this._lineDrawingTool.on('shape:new', this._onNewShape.bind(this));
  }

  /**
   * Hide/Show all {@link PaperShape}s according to the current value of `vm.hideLabeledThingsInFrame`
   *
   * @private
   */
  _applyHiddenLabeledThingsInFrameFilter() {
    this._context.withScope(scope => {
      const drawnShapes = scope.project
        .getItems({
          'class': PaperShape,
        });

      const toHideShapes = drawnShapes
        .filter(
          paperShape => paperShape !== this._$scope.vm.selectedPaperShape
        );
      const toShowShapes = drawnShapes
        .filter(
          paperShape => paperShape === this._$scope.vm.selectedPaperShape
        );

      this._logger.groupStart('thinglayer:hiddenlabels', `Update visibility of non-selected LabeledThingsInFrame (${toHideShapes.length}/${drawnShapes.length})`);
      toHideShapes
        .forEach(
          paperShape => {
            const visible = !this._$scope.vm.hideLabeledThingsInFrame;
            this._logger.log('thinglayer:hiddenlabels', (visible ? 'Showing ' : 'Hiding '), paperShape);
            paperShape.visible = visible;
          }
        );
      toShowShapes
        .forEach(
          paperShape => {
            this._logger.log('thinglayer:hiddenlabels', 'Showing ', paperShape);
            paperShape.visible = true;
          }
        );
      this._logger.groupEnd('thinglayer:hiddenlabels');

      scope.view.update();
    });
  }

  _onLayerClick(event) {
    if (this._$scope.vm.activeTool !== null) {
      return;
    }

    this._context.withScope(scope => {
      const projectPoint = scope.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));

      const hitResult = scope.project.hitTest(projectPoint, {
        class: PaperShape,
        fill: true,
        bounds: true,
        segments: true,
        curves: true,
        center: true,
        tolerance: 3,
      });

      if (hitResult) {
        this._$scope.vm.selectedPaperShape = hitResult.item;
      } else {
        this._$scope.vm.selectedPaperShape = null;
      }
    });
  }

  _onNewShape(shape) {
    // The newly created shape was only temporary as it is rerendered by insertion into
    // the labeledThingsInFrame
    shape.remove();

    this._$scope.vm.labeledThingsInFrame.push(shape.labeledThingInFrame);

    // Process the next steps after the rerendering took place in the next digest cycle
    this._$timeout(() => {
      // The new shape has been rerendered now lets find it
      const newShape = this._context.withScope(scope =>
        scope.project.getItem({
          id: shape.id,
        })
      );
      // @HACK: Unfortunately we can only do this after the initial render. A solution would be to
      //        mark LabeledThingInFrames and LabeledThings as draft as well. Currently this should
      //        suffice, as backend requests should only be made upon selection
      newShape.draft();

      // Reselect the new Shape
      this._$scope.vm.selectedPaperShape = newShape;

      this.emit('shape:new', newShape);
    }, 0);
  }

  /**
   * Activates the tool identified by the given name
   *
   * @param {String} toolName
   */
  activateTool(toolName) {
    // Reset possible mouse cursor left-overs from the last tool
    this._$scope._actionMouseCursor = null;

    this._logger.groupStart('thinglayer:tool', `Switched to tool ${toolName}`);
    switch (toolName) {
      case 'rectangle':
        this._rectangleDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._rectangleDrawingTool);
        break;
      case 'ellipse':
        this._ellipseDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._ellipseDrawingTool);
        break;
      case 'circle':
        this._circleDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._circleDrawingTool);
        break;
      case 'path':
        this._pathDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._pathDrawingTool);
        break;
      case 'polygon':
        this._polygonDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._polygonDrawingTool);
        break;
      case 'line':
        this._lineDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._lineDrawingTool);
        break;
      case 'point':
        this._pointDrawingTool.activate();
        this._logger.log('thinglayer:tool', this._pointDrawingTool);
        break;
      case 'scale':
        this._shapeScaleTool.activate();
        this._logger.log('thinglayer:tool', this._shapeScaleTool);
        break;
      case 'zoomIn':
        this._zoomInTool.activate();
        this._logger.log('thinglayer:tool', this._zoomInTool);
        break;
      case 'zoomOut':
        this._zoomOutTool.activate();
        this._logger.log('thinglayer:tool', this._zoomOutTool);
        break;
      default:
        this._multiTool.activate();
        this._logger.log('thinglayer:tool', this._shapeMoveTool);
    }
    this._logger.groupEnd('thinglayer:tool');
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} labeledThingsInFrame
   * @param {boolean?} update
   */
  addLabeledThingsInFrame(labeledThingsInFrame, update = true) {
    labeledThingsInFrame.forEach((labeledThingInFrame) => {
      this.addLabeledThingInFrame(labeledThingInFrame, false);
    });

    if (update) {
      this._context.withScope((scope) => {
        scope.view.update();
      });
    }
  }

  /**
   * Add a single {@link LabeledThingInFrame} to the layer
   *
   * Optionally it may be specified if the view should be updated after adding the new shapes
   * By default it will be rerendered.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {boolean?} update
   * @param {boolean|undefined} selected
   * @return {Array.<paper.Shape>}
   */
  addLabeledThingInFrame(labeledThingInFrame, update = true, selected = undefined) {
    const selectedPaperShape = this._$scope.vm.selectedPaperShape;
    const selectedLabeledThingInFrame = selectedPaperShape ? selectedPaperShape.labeledThingInFrame : null;
    const selectedLabeledThing = selectedLabeledThingInFrame ? selectedLabeledThingInFrame.labeledThing : null;

    const paperShapes = labeledThingInFrame.shapes.map(shape => {
      // Transport selection between frame changes
      if (selected === undefined) {
        selected = (
          selectedLabeledThingInFrame
          && selectedLabeledThingInFrame !== labeledThingInFrame
          && selectedLabeledThing.id === labeledThingInFrame.labeledThing.id
        );
      }

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
   * Remove all {@link PaperShape}s belonging to any of the given {@link LabeledThingInFrame}s
   *
   * @param {Array.<LabeledThingInFrame>} labeledThingsInFrame
   * @param {boolean?} update
   */
  removeLabeledThingsInFrame(labeledThingsInFrame, update = true) {
    this._context.withScope(
      scope => {
        scope.project.getItems({
          labeledThingInFrame: value => labeledThingsInFrame.indexOf(value) !== -1,
        }).forEach(item => item.remove());

        if (update) {
          scope.view.update();
        }
      }
    );
  }

  attachToDom(element) {
    super.attachToDom(element);

    // Make selection color transparent
    this._context.withScope(scope => {
      scope.project.activeLayer.selectedColor = new scope.Color(0, 0, 0, 0);
      scope.settings.handleSize = 8;
    });

    element.addEventListener('mousedown', event => this._$scope.$evalAsync(this._onLayerClick.bind(this, event)));
  }
}

export default ThingLayer;

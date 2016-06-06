import angular from 'angular';
import paper from 'paper';
import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import RectangleDrawingTool from '../Tools/Rectangle/RectangleDrawingTool';
import PedestrianDrawingTool from '../Tools/Pedestrian/PedestrianDrawingTool';
import EllipseDrawingTool from '../Tools/Ellipse/EllipseDrawingTool';
import CircleDrawingTool from '../Tools/Circle/CircleDrawingTool';
import PathDrawingTool from '../Tools/Path/PathDrawingTool';
import PolygonDrawingTool from '../Tools/Polygon/PolygonDrawingTool';
import LineDrawingTool from '../Tools/Line/LineDrawingTool';
import PointDrawingTool from '../Tools/Point/PointDrawingTool';
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
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ToolService} toolService
   * @param {LoggerService} logger
   * @param {$timeout} $timeout
   * @param {FramePosition} framePosition
   * @param {ModalService} modalService
   * @param {$state} $state
   */
  constructor(width,
              height,
              $scope,
              drawingContextService,
              entityIdService,
              paperShapeFactory,
              entityColorService,
              keyboardShortcutService,
              toolService,
              logger,
              $timeout,
              framePosition,
              modalService,
              $state) {
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
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;

    /**
     * Tool for moving shapes
     *
     * @type {MultiTool}
     * @private
     */
    this._multiTool = new MultiTool($scope.$new(), keyboardShortcutService, toolService, this._context);

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

    try {
      this._initializeShapeCreationTool();
    } catch (error) {
      const errorModal = modalService.getAlertWarningDialog({
        title: 'Unknown Drawing Tool',
        headline: `This task is using the "${this._$scope.vm.task.drawingTool}" drawing tool. This tool is unknown.`,
        message: `The Task could not be opened. Please contact your label coordinator and/or admin about this problem.`,
        confirmButtonText: 'Acknowledged',
      }, () => {
        $state.go('labeling.tasks');
      });
      errorModal.activate();
    }

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
        this._context.withScope(() => {
          oldShape.deselect();
        });

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
        this._context.withScope(() => {
          newShape.select(!this._$scope.vm.readOnly);
        });
      } else {
        // If shape is deselected in hidden LabeledThingInFrame mode switch it off
        if (this._$scope.vm.hideLabeledThingsInFrame) {
          this._$scope.vm.hideLabeledThingsInFrame = false;
        }
      }

      this._applyHiddenLabeledThingsInFrameFilter();
    });

    this._multiTool.on('shape:update', shape => {
      this.emit('shape:update', shape);
    });

    framePosition.beforeFrameChangeAlways('disableTools', () => {
      this._multiTool.disable();
    });
    framePosition.afterFrameChangeAlways('disableTools', () => {
      this._multiTool.enable();
    });
  }

  dispatchDOMEvent(event) {
    this._context.withScope(() => {
      if (event.type === 'mouseleave') {
        this._multiTool.onMouseLeave(event);
      } else {
        this._element.dispatchEvent(event);
      }
    });
  }

  _initializeShapeCreationTool() {
    const task = this._$scope.vm.task;
    const drawingToolOptions = task.drawingToolOptions || {};
    let tool = null;

    switch (task.drawingTool) {
      case 'rectangle':
        tool = new RectangleDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService, drawingToolOptions.rectangle);
        break;
      case 'pedestrian':
        tool = new PedestrianDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService, drawingToolOptions.pedestrian);
        break;
      case 'ellipse':
        tool = new EllipseDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      case 'circle':
        tool = new CircleDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      case 'path':
        tool = new PathDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      case 'polygon':
        tool = new PolygonDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      case 'line':
        tool = new LineDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      case 'point':
        tool = new PointDrawingTool(this._$scope.$new(), this._context, this._entityIdService, this._entityColorService);
        break;
      default:
        throw new Error(`Cannot instantiate tool of unknown type ${this._$scope.vm.task.drawingTool}.`);
    }

    tool.on('shape:new', this._onNewShape.bind(this));

    this._$scope.vm.newShapeDrawingTool = tool;
    this._multiTool.registerCreateTool(tool);
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
        fill: true,
        bounds: false,
        tolerance: 8,
      });

      if (hitResult && hitResult.item.parent.shouldBeSelected(hitResult)) {
        this._logger.log('thinglayer:selection', 'HitTest positive. Selecting: %o', hitResult.item);
        this._$scope.vm.selectedPaperShape = hitResult.item.parent;
      } else {
        this._logger.log('thinglayer:selection', 'HitTest negative. Deselecting');
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
      case 'zoomIn':
        this._zoomInTool.activate();
        this._logger.log('thinglayer:tool', this._zoomInTool);
        break;
      case 'zoomOut':
        this._zoomOutTool.activate();
        this._logger.log('thinglayer:tool', this._zoomOutTool);
        break;
      default:
        if (!this._$scope.vm.readOnly) {
          this._multiTool.activate();
          this._logger.log('thinglayer:tool', this._multiTool);
        } else {
          this._context.withScope(scope => scope.tool = null);
          this._$scope.vm.actionMouseCursor = null;
          this._logger.log('thinglayer:tool', 'Disabled all tools due to readonly task');
        }
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
      let selectedByUserOrAcrossFrameChange = selected;
      if (selected === undefined) {
        selectedByUserOrAcrossFrameChange = (
          selectedLabeledThingInFrame
          && selectedLabeledThingInFrame !== labeledThingInFrame
          && selectedLabeledThing.id === labeledThingInFrame.labeledThing.id
        );
      }

      return this._addShape(labeledThingInFrame, shape, selectedByUserOrAcrossFrameChange, false);
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
      const paperShape = this._paperShapeFactory.createPaperShape(labeledThingInFrame, shape, this._$scope.vm.video);

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

  update() {
    this._context.withScope((scope) => {
      scope.view.update();
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

    // Use `angular.element` here, to normalize the event properties.
    angular.element(element).on(
      'mousedown',
      event => this._$scope.$evalAsync(
        this._onLayerClick.bind(this, event)
      )
    );
  }
}

export default ThingLayer;

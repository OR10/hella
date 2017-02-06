import angular from 'angular';
import paper from 'paper';
import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import ZoomToolActionStruct from '../Tools/ToolActionStructs/ZoomToolActionStruct';
import ZoomTool from '../Tools/ZoomTool';
import MultiToolActionStruct from '../Tools/ToolActionStructs/MultiToolActionStruct';
import MultiTool from '../Tools/MultiTool';

import ToolAbortedError from '../Tools/Errors/ToolAbortedError';
import NotModifiedError from '../Tools/Errors/NotModifiedError';

import PaperShape from '../Shapes/PaperShape';
import hitResolver from '../Support/HitResolver';

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
   * @param {$injector} $injector
   * @param {DrawingContextService} drawingContextService
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {LoggerService} logger
   * @param {$timeout} $timeout
   * @param {FramePosition} framePosition
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   */
  constructor(width,
              height,
              $scope,
              $injector,
              drawingContextService,
              paperShapeFactory,
              logger,
              $timeout,
              framePosition,
              viewerMouseCursorService) {
    super(width, height, $scope, drawingContextService);

    /**
     * @type {Tool|null}
     * @private
     */
    this._activeTool = null;

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
     * @type {FramePosition}
     * @private
     */
    this._framePosition = framePosition;

    /**
     * Tool for moving shapes
     *
     * @type {MultiTool}
     * @private
     */
    this._multiTool = $injector.instantiate(MultiTool, {drawingContext: this._context});
    this._$scope.vm.multiTool = this._multiTool;

    /**
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    /**
     * @type {ZoomTool}
     * @private
     */
    this._zoomInTool = $injector.instantiate(ZoomTool, {drawingContext: this._context});

    /**
     * @type {ZoomTool}
     * @private
     */
    this._zoomOutTool = $injector.instantiate(ZoomTool, {drawingContext: this._context});

    /**
     * @type {LabelStructureThing|null}
     * @private
     */
    this._selectedLabelStructureThing = null;

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

    this._framePosition.beforeFrameChangeAlways('disableTools', () => {
      this._abortActiveTool();
    });
    this._framePosition.afterFrameChangeAlways('disableTools', () => {
      this._invokeActiveTool();
    });
  }

  dispatchDOMEvent(event) {
    this._context.withScope(() => {
      if (event.type === 'mouseleave') {
        this._abortActiveTool()
      } else if (event.type === 'mouseenter') {
        this._invokeActiveTool();
      } else {
        this._element.dispatchEvent(event);
      }
    });
  }

  _invokeActiveTool() {
    if (this._activeTool === null) {
      return;
    }

    switch (true) {
      case this._activeTool instanceof MultiTool:
        this._invokeMultiTool();
        break;
      case this._activeTool instanceof ZoomTool:
        this._invokeZoomTool();
        break;
      default:
        throw new Error(`Unknown active tool. Can not invoke: ${this._activeTool}`);
    }
  }

  _invokeZoomTool() {
    const {viewport} = this._$scope.vm;
    let zoomToolActionStruct;
    if (this._activeTool === this._zoomOutTool) {
      zoomToolActionStruct = new ZoomToolActionStruct(
        {},
        viewport,
        'zoom-out',
        (focalPoint, zoomFactor) => this._$scope.vm.zoomOut(focalPoint, zoomFactor)
      );
    } else {
      zoomToolActionStruct = new ZoomToolActionStruct(
        {},
        viewport,
        'zoom-in',
        (focalPoint, zoomFactor) => this._$scope.vm.zoomIn(focalPoint, zoomFactor)
      );
    }

    this._activeTool
      .invoke(zoomToolActionStruct)
      .then(() => this._invokeActiveTool());
  }

  _invokeMultiTool() {
    // selectedLabelStructure not yet initialized
    if (this._selectedLabelStructureThing === null) {
      return;
    }

    const multiToolOptions = {
      initialDragDistance: 1,
      minDragDistance: 1,
      hitTestTolerance: 8,
    };

    // @TODO: move with other drawint tool options to labelStructureThing
    const delegatedOptions = {
      initialDragDistance: 8,
      minDragDistance: 1,
      minimalHeight: 1,
    };

    const {viewport, video, task} = this._$scope.vm;

    const struct = new MultiToolActionStruct(
      multiToolOptions,
      viewport,
      delegatedOptions,
      video,
      task,
      this._framePosition,
      this._selectedLabelStructureThing.id,
      this._selectedLabelStructureThing.shape
    );
    this._activeTool.invoke(struct)
      .then(({paperShape, actionIdentifier}) => {
        if (actionIdentifier === 'creation') {
          // @TODO: Is the shape really needed in the higher level or is a ltif sufficient?
          // Ensure the parent/child structure is intact
          const labeledThingInFrame = paperShape.labeledThingInFrame;
          labeledThingInFrame.shapes.push(paperShape.toJSON());
          this._onCreateShape(paperShape);
        } else {
          this.emit('shape:update', paperShape);
        }

        this._invokeActiveTool();
      })
      .catch(reason => {
        switch (true) {
          case reason instanceof ToolAbortedError:
            this._logger.log('tool:error', 'Tool aborted', reason);
            break;
          case reason instanceof NotModifiedError:
            this._logger.log('tool:error', 'No modification executed', reason);
            this._invokeActiveTool();
            break;
          default:
            this._logger.warn('tool:error', 'Tool aborted with unknown reason', reason);
        }
      });
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
    if (this._$scope.vm.activeTool !== 'multi') {
      return;
    }

    this._context.withScope(scope => {
      const projectPoint = scope.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));

      const hitResult = scope.project.hitTest(projectPoint, {
        fill: true,
        bounds: false,
        tolerance: 8,
      });

      if (hitResult) {
        const [hitShape] = hitResolver.resolve(hitResult.item);
        if (hitShape.shouldBeSelected(hitResult)) {
          this._logger.log('thinglayer:selection', 'HitTest positive. Selecting: %o', hitShape);
          this._$scope.vm.selectedPaperShape = hitShape;
        } else {
          this._logger.log('thinglayer:selection', 'Shape decided not to be selected. Deselecting');
          this._$scope.vm.selectedPaperShape = null;
        }
      } else {
        this._logger.log('thinglayer:selection', 'Nothing hit. Deselecting');
        this._$scope.vm.selectedPaperShape = null;
      }
    });
  }

  /**
   * @private
   */
  _abortActiveTool() {
    if (this._activeTool !== null) {
      this._activeTool.abort();
    }
  }

  /**
   * Activates the tool identified by the given name
   *
   * @param {String} toolName
   * @param {LabelStructureThing|null} selectedLabelStructureThing
   */
  activateTool(toolName, selectedLabelStructureThing) {
    this._abortActiveTool();
    // @TODO can be removed when zoomtools are refactored
    this._context.withScope(scope => {
      scope.tool = null;
    });
    this._selectedLabelStructureThing = selectedLabelStructureThing;

    // Reset possible mouse cursor left-overs from the last tool
    this._viewerMouseCursorService.setMouseCursor(null);

    this._logger.groupStart('thinglayer:tool', `Switched to tool ${toolName}`);
    switch (toolName) {
      case 'zoomIn':
        this._activeTool = this._zoomInTool;
        this._logger.log('thinglayer:tool', this._zoomInTool);
        break;
      case 'zoomOut':
        this._activeTool = this._zoomOutTool;
        this._logger.log('thinglayer:tool', this._zoomOutTool);
        break;
      case 'multi':
        this._activeTool = this._multiTool;
        this._logger.log('thinglayer:tool', this._multiTool);
        break;
      default:
        throw new Error(`Unknown tool with name: ${toolName}`);
    }
    this._invokeActiveTool();
    this._logger.groupEnd('thinglayer:tool');
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} labeledThingsInFrame
   * @param {boolean?} update
   */
  addLabeledThingsInFrame(labeledThingsInFrame, update = true) {
    labeledThingsInFrame.forEach(labeledThingInFrame => {
      this.addLabeledThingInFrame(labeledThingInFrame, false);
    });

    if (update) {
      this._context.withScope(scope => {
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
      this._context.withScope(scope => {
        scope.view.update();
      });
    }

    return paperShapes;
  }

  /**
   * @param {PaperShape} shape
   * @private
   */
  _onCreateShape(shape) {
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

      this.emit('shape:create', newShape);
    }, 0);
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
        this._context.withScope(scope => {
          scope.view.update();
        });
      }

      return paperShape;
    });
  }

  update() {
    this._context.withScope(scope => {
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

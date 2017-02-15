import angular from 'angular';
import paper from 'paper';
import PanAndZoomPaperLayer from './PanAndZoomPaperLayer';
import ZoomToolActionStruct from '../Tools/ToolActionStructs/ZoomToolActionStruct';
import ZoomTool from '../Tools/ZoomTool';
import MultiToolActionStruct from '../Tools/ToolActionStructs/MultiToolActionStruct';
import CreationToolActionStruct from '../Tools/ToolActionStructs/CreationToolActionStruct';
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
   * @param {DrawingContext} drawingContext
   * @param {ToolService} toolService
   * @param {PaperShapeFactory} paperShapeFactory
   * @param {LoggerService} logger
   * @param {$timeout} $timeout
   * @param {FramePosition} framePosition
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   * @param {LabeledThingGroupService} labeledThingGroupService
   */
  constructor(width,
              height,
              $scope,
              $injector,
              drawingContext,
              toolService,
              paperShapeFactory,
              logger,
              $timeout,
              framePosition,
              viewerMouseCursorService,
              labeledThingGroupService) {
    super(width, height, $scope, drawingContext);

    /**
     * @type {ToolService}
     * @private
     */
    this._toolService = toolService;

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
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    /**
     * @type {LabeledThingGroupService}
     * @private
     */
    this._labeledThingGroupService = labeledThingGroupService;

    /**
     * @type {Tool|null}
     * @private
     */
    this._activeTool = null;

    /**
     * Tool for moving shapes
     *
     * @type {MultiTool}
     * @private
     */
    this._multiTool = $injector.instantiate(MultiTool, {drawingContext: this._context});

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

    /**
     * @type {boolean}
     * @private
     */
    this._mouseIsPressed = false;

    /**
     * @type {{x: Number, y: Number}|null}
     * @private
     */
    this._lastMouseDownEvent = null;


    $scope.$watchCollection('vm.paperThingShapes', (newPaperThingShapes, oldPaperThingShapes) => {
      const oldSet = new Set(oldPaperThingShapes);
      const newSet = new Set(newPaperThingShapes);

      const addedPaperThingShapes = newPaperThingShapes.filter(item => !oldSet.has(item));
      const removedPaperThingShapes = oldPaperThingShapes.filter(item => !newSet.has(item));

      this.addPaperThingShapes(addedPaperThingShapes, false);
      this.removePaperThingShapes(removedPaperThingShapes, false);

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
        if (oldShape.labeledThingInFrame.ghost === true) {
          const index = this._$scope.vm.paperThingShapes.indexOf(oldShape);
          if (index !== -1) {
            this._$scope.vm.paperThingShapes.splice(index, 1);
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

    $scope.$root.$on('action:create-new-default-shape', () => {
      if (this._selectedLabelStructureThing === null) {
        return;
      }

      this._invokeDefaultShapeCreation();
    });
  }

  dispatchDOMEvent(event) {
    this._context.withScope(() => {
      if (event.type === 'mouseleave') {
        this._mouseIsPressed = false;
        this._lastMouseDownEvent = null;

        this._abortActiveTool();
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

    // Insure no parallel double invocation is possible.
    this._activeTool.abort();

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

  /**
   * @private
   */
  _invokeDefaultShapeCreation() {
    // @TODO: move with other drawint tool options to labelStructureThing
    const toolOptions = {
      initialDragDistance: 8,
      minDragDistance: 1,
      minimalHeight: 1,
    };

    const {viewport, video, task, framePosition} = this._$scope.vm;

    /** @type {CreationTool} */
    const tool = this._toolService.getTool(this._context, this._selectedLabelStructureThing.shape, 'creation');
    const creationToolStruct = new CreationToolActionStruct(
      toolOptions,
      viewport,
      video,
      task,
      framePosition,
      this._selectedLabelStructureThing.id
    );
    tool.invokeDefaultShapeCreation(creationToolStruct)
      .then(paperShape => {
        // @TODO: Is the shape really needed in the higher level or is a ltif sufficient?
        // Ensure the parent/child structure is intact
        const labeledThingInFrame = paperShape.labeledThingInFrame;
        labeledThingInFrame.shapes.push(paperShape.toJSON());
        this._onCreateShape(paperShape);
      })
      .catch(reason => {
        this._logger.warn('tool:error', 'Default creation Tool aborted', reason);
      });
  }

  /**
   * @private
   */
  _invokeMultiTool() {
    // Ensure the multitool is not currently "invoked" before reinvocation
    this._multiTool.abort();

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

    const {viewport, video, task, selectedPaperShape} = this._$scope.vm;

    const struct = new MultiToolActionStruct(
      multiToolOptions,
      viewport,
      delegatedOptions,
      video,
      task,
      this._framePosition,
      this._selectedLabelStructureThing.id,
      this._selectedLabelStructureThing.shape,
      selectedPaperShape
    );
    this._activeTool.invoke(struct)
      .then(({paperShape, actionIdentifier}) => {
        if (actionIdentifier === 'creation') {
          // @TODO: Is the shape really needed in the higher level or is a ltif sufficient?
          // Ensure the parent/child structure is intact
          const labeledThingInFrame = paperShape.labeledThingInFrame;
          labeledThingInFrame.shapes.push(paperShape.toJSON());
          this._onCreateShape(paperShape);
        } else if (actionIdentifier === 'selection') {
          this._$scope.vm.selectedPaperShape = paperShape;
        } else {
          this.emit('shape:update', paperShape);
        }


        // Wait until the angular $digest is complete, before dispatching the event.
        // This is needed for the selectedLabeledStructureThing to settle.
        this._$timeout(() => {
          this._invokeActiveTool();

          this._context.withScope(scope => {
            if (actionIdentifier === 'selection' && this._mouseIsPressed) {
              const {offsetX, offsetY} = this._lastMouseDownEvent;
              const projectPoint = scope.view.viewToProject(new paper.Point(offsetX, offsetY));
              const paperEvent = new paper.MouseEvent(
                'mousedown',
                this._lastMouseDownEvent,
                projectPoint,
                this,
                0
              );

              this._activeTool.onMouseDown(paperEvent);
            }
          });
        });
      })
      .catch(reason => {
        switch (true) {
          case reason instanceof ToolAbortedError:
            // No further processing needed.
            break;
          case reason instanceof NotModifiedError:
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
    this._logger.groupEnd('thinglayer:tool');
    this._invokeActiveTool();
  }

  /**
   * Adds the given thing to this layer and draws its respective shapes
   *
   * @param {Array<LabeledThingInFrame>} paperThingShapes
   * @param {boolean?} update
   */
  addPaperThingShapes(paperThingShapes, update = true) {
    paperThingShapes.forEach(paperThingShape => {
      this.addPaperThingShape(paperThingShape, false);
    });

    if (update) {
      this._context.withScope(scope => {
        scope.view.update();
      });
    }
  }
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
   * @param {PaperThingShape} paperThingShape
   * @param {boolean?} update
   * @param {boolean|undefined} selected
   * @return {Array.<paper.Shape>}
   */
  addPaperThingShape(paperThingShape, update = true, selected = undefined) {
    const selectedPaperShape = this._$scope.vm.selectedPaperShape;
    const selectedLabeledThingInFrame = selectedPaperShape ? selectedPaperShape.labeledThingInFrame : null;
    const selectedLabeledThing = selectedLabeledThingInFrame ? selectedLabeledThingInFrame.labeledThing : null;

    // Transport selection between frame changes
    let selectedByUserOrAcrossFrameChange = selected;
    if (selected === undefined) {
      selectedByUserOrAcrossFrameChange = (
        selectedLabeledThingInFrame
        && selectedLabeledThingInFrame !== paperThingShape.labeledThingInFrame
        && selectedLabeledThing.id === paperThingShape.labeledThingInFrame.labeledThing.id
      );
    }

    if (update) {
      this._context.withScope(scope => {
        scope.view.update();
      });
    }

    this._updateSelectedShapeAndView(paperThingShape, selectedByUserOrAcrossFrameChange, false);
  }

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
    // The newly created shape was only temporary as it is rerendered by insertion into
    // the labeledThingsInFrame
    shape.remove();

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
   * @param {PaperShape} paperShape
   * @param {boolean} selected
   * @param {boolean?} update
   * @returns {paper.Shape}
   * @private
   */
  _updateSelectedShapeAndView(paperShape, selected = false, update = true) {
    if (selected) {
      this._$scope.vm.selectedPaperShape = paperShape;
    }

    if (update) {
      this._context.withScope(scope => {
        scope.view.update();
      });
    }

    return paperShape;
  }

  /**
   * Update the scopes view
   */
  update() {
    this._context.withScope(scope => {
      scope.view.update();
    });
  }

  /**
   * Remove all {@link PaperShape}s belonging to any of the given {@link LabeledThingInFrame}s
   *
   * @param {Array.<PaperThingShape>} paperThingShapes
   * @param {boolean?} update
   */
  removePaperThingShapes(paperThingShapes, update = true) {
    this._context.withScope(scope => {
      // Find all shapes and get their labeledThingInFrame
      scope.project.getItems({
        labeledThingInFrame: labeledThingInFrame => {
          paperThingShapes.filter(paperThingShape => paperThingShape.labeledThingInFrame.id === labeledThingInFrame.id);
        },
      }).forEach(item => item.remove());

      if (update) {
        scope.view.update();
      }
    });
  }

  _onMouseDown(event) {
    this._mouseIsPressed = true;
    this._lastMouseDownEvent = event;
  }

  _onMouseUp() {
    this._mouseIsPressed = false;
    this._lastMouseDownEvent = null;
  }

  attachToDom(element) {
    // The event registration needs to be done before paper is initialized in the base class. This is needed for the
    // Layer to handle events, before tools are informed about them.
    angular.element(element).on(
      'mousedown',
      event => this._onMouseDown(event)
    );

    angular.element(element).on(
      'mouseup',
      event => this._onMouseUp(event)
    );

    super.attachToDom(element);

    // Make selection color transparent
    this._context.withScope(scope => {
      scope.project.activeLayer.selectedColor = new scope.Color(0, 0, 0, 0);
      scope.settings.handleSize = 8;
    });
  }
}

export default ThingLayer;

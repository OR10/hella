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
import PaperThingShape from '../Shapes/PaperThingShape';
import PaperGroupShape from '../Shapes/PaperGroupShape';

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
   * @param {Object} applicationState
   * @param {ModalService} modalService
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
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
              labeledThingGroupService,
              applicationState,
              modalService,
              labeledThingGateway,
              labeledThingGroupGateway
              ) {
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
    this._isMousePressed = false;

    /**
     * @type {{x: Number, y: Number}|null}
     * @private
     */
    this._lastMouseDownEvent = null;

    /**
     * @type {Object}
     * @private
     */
    this._applicationState = applicationState;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;

    $scope.$watchCollection('vm.paperGroupShapes', (newPaperGroupShapes, oldPaperGroupShapes) => {
      const oldSet = new Set(oldPaperGroupShapes);
      const newSet = new Set(newPaperGroupShapes);

      const addedPaperGroupShapes = newPaperGroupShapes.filter(item => !oldSet.has(item));
      const removedPaperGroupShapes = oldPaperGroupShapes.filter(item => !newSet.has(item));

      this.addPaperGroupShapes(addedPaperGroupShapes, false);
      this.removePaperShapes(removedPaperGroupShapes, false);

      // this._applyHiddenLabeledThingsInFrameFilter();
    });

    $scope.$watchCollection('vm.paperThingShapes', (newPaperThingShapes, oldPaperThingShapes) => {
      const oldSet = new Set(oldPaperThingShapes);
      const newSet = new Set(newPaperThingShapes);

      const addedPaperThingShapes = newPaperThingShapes.filter(item => !oldSet.has(item));
      const removedPaperThingShapes = oldPaperThingShapes.filter(item => !newSet.has(item));

      this.addPaperThingShapes(addedPaperThingShapes, false);
      this.removePaperShapes(removedPaperThingShapes, false);

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

        if (oldShape instanceof PaperThingShape) {
          // Remove a Ghost upon deselection
          if (oldShape.labeledThingInFrame.ghost === true) {
            const index = this._$scope.vm.paperThingShapes.indexOf(oldShape);
            if (index !== -1) {
              this._$scope.vm.paperThingShapes.splice(index, 1);
            }
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

    $scope.$root.$on('action:delete-shape', (event, shape) => {
      switch (true) {
        case shape instanceof PaperThingShape:
          this._deleteThingShape(shape);
          break;
        case shape instanceof PaperGroupShape:
          this._deleteGroupShape(shape);
          break;
        default:
          throw new Error('Cannot delete shape of unknown type');
      }
    });
  }

  /**
   * @param {PaperThingShape} shape
   * @private
   */
  _deleteThingShape(shape) {
    const viewModel = this._$scope.vm;
    const selectedLabeledThingInFrame = shape.labeledThingInFrame;
    const selectedLabeledThing = selectedLabeledThingInFrame.labeledThing;
    this._applicationState.disableAll();

    // TODO: fix the revision error in the backend
    try {
      this._labeledThingGateway.deleteLabeledThing(selectedLabeledThing)
          .then(() => {
            shape.remove();
            viewModel.selectedPaperShape = null;
            viewModel.paperThingShapes = viewModel.paperThingShapes.filter(
                paperThingShape => paperThingShape.labeledThingInFrame.id !== selectedLabeledThingInFrame.id
            );

            return selectedLabeledThing;
          })
          .then(() => {
            selectedLabeledThing.groupIds.forEach(groupId => {
              const relatedThingShapes = viewModel.paperThingShapes.filter(thingShape =>
              thingShape.labeledThingInFrame.labeledThing.groupIds.indexOf(groupId) !== -1);
              const shapeGroup = viewModel.paperGroupShapes.find(
                  paperGroupShape => paperGroupShape.labeledThingGroupInFrame.labeledThingGroup.id === groupId);

              if (relatedThingShapes.length === 0) {
                return this._deleteGroupShape(shapeGroup);
              }
            });
          })
          .then(() => {
            this._deleteAfterAction();
          })
          .catch(() => this._onDeletionError());
    } catch (error) {
      this._onDeletionError();
    }
  }

  /**
   * @param {PaperGroupShape} shape
   * @private
   */
  _deleteGroupShape(shape) {
    const viewModel = this._$scope.vm;
    const labeledThingGroup = shape.labeledThingGroupInFrame.labeledThingGroup;
    const relatedThingShapes = viewModel.paperThingShapes.filter(
        thingShape => thingShape.labeledThingInFrame.labeledThing.groupIds.indexOf(labeledThingGroup.id) !== -1
    );
    const relatedLabeledThings = relatedThingShapes.map(thingShape => thingShape.labeledThingInFrame.labeledThing);

    this._applicationState.disableAll();

    try {
      this._labeledThingGroupGateway.unassignLabeledThingsToLabeledThingGroup(relatedLabeledThings, labeledThingGroup)
          .then(() => {
            return this._labeledThingGroupGateway.deleteLabeledThingGroup(labeledThingGroup);
          })
          .then(() => {
            shape.remove();
            viewModel.selectedPaperShape = null;
            viewModel.paperGroupShapes = viewModel.paperGroupShapes.filter(
                paperGroupShape => paperGroupShape.labeledThingGroupInFrame.labeledThingGroup.id !== labeledThingGroup.id
            );
            this._deleteAfterAction();
          })
          .catch(() => this._onDeletionError());
    } catch (error) {
      this._onDeletionError();
    }
  }

  /**
   * @private
   */
  _deleteAfterAction() {
    this._applicationState.enableAll();
    this._context.withScope(scope => scope.view.update());
  }

  /**
   * @private
   */
  _onDeletionError() {
    this._applicationState.enableAll();
    this._modalService.info(
      {
        title: 'Error',
        headline: 'There was an error deleting the selected shape. Please reload the page and try again!',
      },
      undefined,
      undefined,
      {
        warning: true,
        abortable: false,
      }
    );
  }

  dispatchDOMEvent(event) {
    this._context.withScope(() => {
      if (event.type === 'mouseleave') {
        this._isMousePressed = false;
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
        switch (true) {
          case paperShape instanceof PaperThingShape:
            // Ensure the parent/child structure is intact
            // const labeledThingInFrame = paperShape.labeledThingInFrame;
            // labeledThingInFrame.shapes.push(paperShape.toJSON());

            this._$scope.vm.paperThingShapes.push(paperShape);
            this.emit('thing:create', paperShape);
            break;
          case paperShape instanceof PaperGroupShape:
            throw new Error('Cannot create default shape for groups!');
          default:
            throw new Error(`Can not handle shape creation of type: ${paperShape}`);
        }
      })
      .catch(reason => {
        this._logger.warn('tool:error', 'Default creation Tool aborted', reason);
      });
  }

  /**
   * Get Options for a certain tool
   *
   * Should be handled using a proper ToolOptionStruct in the future.
   * This is just a workaround to use the old `Task` based config options until
   * a refactoring has been done!
   *
   * @param {Task} task
   * @param {string} shapeName
   * @param {Object} defaultOptions
   * @return {Object}
   * @private
   */
  _getOptionsForTool(task, shapeName, defaultOptions) {
    const extractedTaskOptions = {};
    [
      'minimalVisibleShapeOverflow',
    ].forEach(property => {
      if (task[property] !== undefined) {
        extractedTaskOptions[property] = task[property];
      }
    });

    const drawingToolOptions = task.drawingToolOptions === undefined ? {} : task.drawingToolOptions;
    const extractedToolOptions = Object.assign({}, drawingToolOptions[shapeName]);

    return Object.assign({}, defaultOptions, extractedTaskOptions, extractedToolOptions);
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

    const {viewport, video, task, selectedPaperShape} = this._$scope.vm;

    // @TODO: move with other drawint tool options to labelStructureThing
    // @TODO: Should be handled using a proper ToolOptionStruct in the future.
    //        This is just a workaround to use the old `Task` based config options until
    //        a refactoring has been done!
    const defaultOptions = {
      initialDragDistance: 8,
      minDragDistance: 1,
      minimalHeight: 1,
    };
    const delegatedOptions = this._getOptionsForTool(task, this._selectedLabelStructureThing.shape, defaultOptions);

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
          switch (true) {
            case paperShape instanceof PaperThingShape:
              // @TODO: Is the shape really needed in the higher level or is a ltif sufficient?
              // Ensure the parent/child structure is intact
              this._$scope.vm.paperThingShapes.push(paperShape);
              this.emit('thing:create', paperShape);
              break;
            case paperShape instanceof PaperGroupShape:
              this._$scope.vm.paperGroupShapes.push(paperShape);
              this.emit('group:create', paperShape);
              break;
            default:
              throw new Error(`Can not handle shape creation of type: ${paperShape}`);
          }
        } else if (actionIdentifier === 'selection') {
          this._$scope.vm.selectedPaperShape = paperShape;
        } else {
          switch (true) {
            case paperShape instanceof PaperThingShape:
              this.emit('thing:update', paperShape);
              break;
            case paperShape instanceof PaperGroupShape:
              this.emit('group:update', paperShape);
              break;
            default:
              throw new Error(`Can not handle shape update of type: ${paperShape}`);
          }
        }


        // Wait until the angular $digest is complete, before dispatching the event.
        // This is needed for the selectedLabeledStructureThing to settle.
        this._$timeout(() => {
          this._invokeActiveTool();

          if (this._isMousePressed) {
            this._redeliverMouseDownToActiveTool();
          }
        });
      })
      .catch(reason => {
        switch (true) {
          case reason instanceof ToolAbortedError:
            // Update the view, instantly removing the shape
            this._context.withScope(scope => {
              scope.view.update();
            });
            break;
          case reason instanceof NotModifiedError:
            this._invokeActiveTool();
            if (this._isMousePressed) {
              this._redeliverMouseDownToActiveTool();
            }
            break;
          default:
            this._logger.warn('tool:error', 'Tool aborted with unknown reason', reason);
        }
      });
  }

  _redeliverMouseDownToActiveTool() {
    this._context.withScope(scope => {
      const {offsetX, offsetY} = this._lastMouseDownEvent;
      const projectPoint = scope.view.viewToProject(new paper.Point(offsetX, offsetY));
      const paperEvent = new paper.MouseEvent(
        'mousedown',
        this._lastMouseDownEvent,
        projectPoint,
        this,
        0
      );

      this._activeTool.delegateMouseEvent('down', paperEvent);
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

  /**
   * Adds the given thing group to this layer and draws its respective shapes
   *
   * @param {Array<PaperGroupShape>} paperGroupShapes
   * @param {boolean?} update
   */
  addPaperGroupShapes(paperGroupShapes, update = true) {
    paperGroupShapes.forEach(labeledThingGroupInFrame => {
      this.addPaperGroupShape(labeledThingGroupInFrame, false);
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

  /**
   * Add a single {@link LabeledThingGroupInFrame} to the layer
   *
   * Optionally it may be specified if the view should be updated after adding the new shapes
   * By default it will be rerendered.
   *
   * @param {PaperGroupShape} paperGroupShape
   * @param {boolean?} update
   * @param {boolean|undefined} selected
   * @return {Array.<paper.Shape>}
   */
  addPaperGroupShape(paperGroupShape, update = true, selected = undefined) {
    const selectedPaperShape = this._$scope.vm.selectedPaperShape;
    const selectedLabeledThingGroupInFrame = selectedPaperShape ? selectedPaperShape.labeledThingGroupInFrame : null;
    const selectedLabeledThingGroup = selectedLabeledThingGroupInFrame ? selectedLabeledThingGroupInFrame.labeledThingGroup : null;

    // Transport selection between frame changes
    let selectedByUserOrAcrossFrameChange = selected;
    if (selected === undefined) {
      selectedByUserOrAcrossFrameChange = (
        selectedLabeledThingGroupInFrame
        && selectedLabeledThingGroupInFrame !== paperGroupShape.labeledThingGroupInFrame
        && selectedLabeledThingGroup.id === paperGroupShape.labeledThingGroupInFrame.labeledThingGroup.id
      );
    }

    if (update) {
      this._context.withScope(scope => {
        scope.view.update();
      });
    }

    this._updateSelectedShapeAndView(paperGroupShape, selectedByUserOrAcrossFrameChange, false);
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
   * @param {Array.<PaperShape>} paperShapes
   * @param {boolean?} update
   */
  removePaperShapes(paperShapes, update = true) {
    this._context.withScope(scope => {
      paperShapes.forEach(shape => {
        shape.remove();
      });
      if (update) {
        scope.view.update();
      }
    });
  }

  _onMouseDown(event) {
    this._isMousePressed = true;
    this._lastMouseDownEvent = event;
  }

  _onMouseUp() {
    this._isMousePressed = false;
    this._lastMouseDownEvent = null;
  }

  attachToDom(element) {
    // The event registration needs to be done before paper is initialized in the base class. This is needed for the
    // Layer to handle events, before tools are informed about them.
    const angularElement = angular.element(element);

    angularElement.on(
      'mousedown',
      event => this._onMouseDown(event)
    );

    angularElement.on(
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

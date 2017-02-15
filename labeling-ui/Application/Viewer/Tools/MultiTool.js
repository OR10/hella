import Tool from './NewTool';
import paper from 'paper';
import PaperRectangle from '../../Viewer/Shapes/PaperRectangle';
import PaperGroupRectangle from '../../Viewer/Shapes/PaperGroupRectangle';
import PaperPedestrian from '../../Viewer/Shapes/PaperPedestrian';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import PaperPolygon from '../../Viewer/Shapes/PaperPolygon';
import CuboidInteractionResolver from '../../ThirdDimension/Support/CuboidInteractionResolver';
import hitResolver from '../Support/HitResolver';

import CreationToolActionStruct from './ToolActionStructs/CreationToolActionStruct';
import MovingToolActionStruct from './ToolActionStructs/MovingToolActionStruct';
import ScalingToolActionStruct from './ToolActionStructs/ScalingToolActionStruct';

/**
 * A multi tool for handling multiple functionalities
 * Extends Tool and not Mutation- or CreationTool as it implements both interfaces which can't be interfaces due to lack
 * of javascript capabilities.
 *
 * @extends Tool
 */
class MultiTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $scope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {ToolService} toolService
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   */
  constructor(drawingContext, $scope, $q, loggerService, keyboardShortcutService, toolService, viewerMouseCursorService) {
    super(drawingContext, $scope, $q, loggerService);

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {ToolService}
     * @private
     */
    this._toolService = toolService;

    /**
     * @type {ViewerMouseCursorService}
     * @private
     */
    this._viewerMouseCursorService = viewerMouseCursorService;

    /**
     * The currently active tool
     *
     * @type {Tool}
     * @private
     */
    this._activeTool = null;

    /**
     * @type {boolean}
     * @private
     */
    this._toolDelegationInvoked = false;
  }

  /**
   * @returns {string}
   */
  getToolName() {
    return 'multi';
  }

  /**
   * @returns {string[]}
   */
  getActionIdentifiers() {
    return [
      'creation',
      'move',
      'scale',
    ];
  }

  /**
   * @param {MultiToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invoke(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    // if (!this._readOnly) {
    //   // Register Keyboard shortcuts
    //   this._registerShortcuts();
    // }
    // this._initializeOptions(options);

    return promise;
  }

  abort() {
    if (this._toolDelegationInvoked) {
      this._activeTool.abort();
    }

    super.abort();
  }

  // /**
  //  * @param {Object} options
  //  * @private
  //  */
  // _initializeOptions(options) {
  //   const defaultOptions = {
  //     minDistance: 1,
  //     hitTestTolerance: 8,
  //   };
  //   this._options = Object.assign({}, defaultOptions, options);
  // }

  /**
   * @param {string} requirementsShape
   * @private
   */
  _invokeCreationToolDelegation(requirementsShape) {
    const tool = this._getToolForRequirementsShape(requirementsShape);
    this._invokeToolDelegation(tool, 'creation', null, null);
  }

  /**
   * @param {string} requirementsShape
   * @return {Tool}
   * @private
   */
  _getToolForRequirementsShape(requirementsShape) {
    switch (requirementsShape) {
      case 'rectangle':
        return this._toolService.getTool(this._context, PaperRectangle.getClass());
      case 'pedestrian':
        return this._toolService.getTool(this._context, PaperPedestrian.getClass());
      case 'cuboid':
        return this._toolService.getTool(this._context, PaperCuboid.getClass());
      case 'polygon':
        return this._toolService.getTool(this._context, PaperPolygon.getClass());
      case 'group-rectangle':
        return this._toolService.getTool(this._context, PaperGroupRectangle.getClass());
      default:
        throw new Error(`Cannot create tool of unknown type: ${requirementsShape}.`);
    }
  }

  /**
   * @param {paper.Event} event
   * @private
   */
  onMouseDown(event) {
    // Shift is only used for zoom panning
    if (event.event.shiftKey) {
      return;
    }

    const point = event.point;

    if (this._toolDelegationInvoked) {
      this._activeTool.onMouseDown(event);
      return;
    }

    this._handleMouseDownCursor(point);

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._toolActionStruct.options.hitTestTolerance,
      });

      // Hit nothing
      if (!hitResult) {
        // Deselction if there was a selection
        if (this._toolActionStruct.selectedPaperShape !== null) {
          this._complete({actionIdentifier: 'selection', paperShape: null});
          return;
        }
        // Invoke shape creation
        this._invokeCreationToolDelegation(this._toolActionStruct.requirementsShape);
        this._activeTool.onMouseDown(event);
        return;
      }

      // Hit something
      const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);

      // If selected paperShape changed select the new one
      if (this._toolActionStruct.selectedPaperShape !== hitShape) {
        this._complete({actionIdentifier: 'selection', paperShape: hitShape});
        return;
      }

      // Invoke mutation tool
      const actionIdentifier = hitShape.getToolActionIdentifier(hitHandle);
      this._invokeToolDelegation(this._toolService.getTool(this._context, hitShape.getClass(), actionIdentifier), actionIdentifier, hitShape, hitHandle);
      this._activeTool.onMouseDown(event);
    });
  }

  /**
   * @param {Tool} tool
   * @param {string} actionIdentifier
   * @param {PaperShape} shape
   * @param {Handle} handle
   * @private
   */
  _invokeToolDelegation(tool, actionIdentifier, shape, handle) {
    this._toolDelegationInvoked = true;
    const {viewport, video, task, framePosition, requirementsThingOrGroupId, delegatedOptions} = this._toolActionStruct;
    let promise = null;
    let struct = null;

    // @TODO: Add tool class check
    switch (actionIdentifier) {
      case 'creation':
        /** @var {CreationTool} tool */
        struct = new CreationToolActionStruct(
          delegatedOptions,
          viewport,
          video,
          task,
          framePosition,
          requirementsThingOrGroupId,
        );
        promise = tool.invokeShapeCreation(struct);
        break;
      case 'scale':
        /** @var {ScalingTool} tool */
        struct = new ScalingToolActionStruct(
          delegatedOptions,
          viewport,
          shape,
          handle
        );
        promise = tool.invokeShapeScaling(struct);
        break;
      case 'move':
        /** @var {MovingTool} tool */
        struct = new MovingToolActionStruct(
          delegatedOptions,
          viewport,
          shape
        );
        promise = tool.invokeShapeMoving(struct);
        break;
      default:
        throw new Error(`Unknown actionIdentifier: ${actionIdentifier}`);
    }

    this._activeTool = tool;

    promise.then(paperShape => {
      this._toolDelegationInvoked = false;
      this._complete({actionIdentifier, paperShape});
    }).catch(reason => {
      this._toolDelegationInvoked = false;
      this._reject(reason);
    });
  }

  /**
   * @param {paper.Event} event
   */
  onMouseMove(event) {
    // Shift is used for zoom panning
    if (event.event.shiftKey) {
      return;
    }

    if (this._toolDelegationInvoked) {
      this._activeTool.onMouseMove(event);
      return;
    }

    this._handleMouseMoveCursor(event.point);
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseMoveCursor(point) {
    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._toolActionStruct.options.hitTestTolerance,
      });

      if (!hitResult) {
        if (this._viewerMouseCursorService.isCrosshairShowing()) {
          this._viewerMouseCursorService.setMouseCursor('none');
        } else {
          this._viewerMouseCursorService.setMouseCursor(null);
        }
      } else {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        this._viewerMouseCursorService.setMouseCursor(hitShape.getCursor(hitHandle));
      }
    });
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseDownCursor(point) {
    if (this._viewerMouseCursorService.isCrosshairShowing()) {
      this._viewerMouseCursorService.setMouseCursor('none');
    } else {
      this._context.withScope(scope => {
        const hitResult = scope.project.hitTest(point, {
          fill: true,
          bounds: false,
          tolerance: this._toolActionStruct.options.hitTestTolerance,
        });

        if (hitResult) {
          const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
          this._viewerMouseCursorService.setMouseCursor(hitShape.getCursor(hitHandle, true));
        }
      });
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  onMouseUp(event) {
    // Shift is only used for zoom panning
    if (event.shiftkey) {
      return;
    }

    if (this._toolDelegationInvoked) {
      this._activeTool.onMouseUp(event);
      return;
    }

    this._handleMouseUpCursor(event.point);
  }

  /**
   * @param {Point} point
   * @private
   */
  _handleMouseUpCursor(point) {
    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: false,
        tolerance: this._toolActionStruct.options.hitTestTolerance,
      });
      if (hitResult) {
        const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
        this._viewerMouseCursorService.setMouseCursor(hitShape.getCursor(hitHandle, false));
      }
    });
  }

  /**
   * @param {paper.Event} event
   * @private
   */
  onMouseDrag(event) {
    // Shift is used for zoom panning
    if (event.event.shiftKey) {
      return;
    }

    if (this._toolDelegationInvoked) {
      this._activeTool.onMouseDrag(event);
    }
  }

  /**
   * @param {CreationToolActionStruct} toolActionStruct
   */
  invokeDefaultShapeCreation(toolActionStruct) {
    this._getToolForRequirementsShape(toolActionStruct.requirementsShape);
    const {viewport, video, task, framePosition, requirementsThingOrGroupId} = this._toolActionStruct;
    const struct = new CreationToolActionStruct(
      viewport,
      video,
      task,
      framePosition,
      requirementsThingOrGroupId
    );

    return this._activeTool.invokeDefaultShapeCreation(struct);
  }


  // _registerShortcuts() {
  //   const keyboardMoveDistance = 1;
  //   const keyboardFastMoveDistance = 10;
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'up',
  //     description: 'Move selected shape up',
  //     callback: () => this._moveSelectedShapeBy(0, keyboardMoveDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+up',
  //     description: 'Move selected shape up (fast)',
  //     callback: () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance * -1),
  //   });
  //
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'down',
  //     description: 'Move selected shape down',
  //     callback: () => this._moveSelectedShapeBy(0, keyboardMoveDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+down',
  //     description: 'Move selected shape down (fast)',
  //     callback: () => this._moveSelectedShapeBy(0, keyboardFastMoveDistance),
  //   });
  //
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'left',
  //     description: 'Move selected shape left',
  //     callback: () => this._moveSelectedShapeBy(keyboardMoveDistance * -1, 0),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+left',
  //     description: 'Move selected shape left (fast)',
  //     callback: () => this._moveSelectedShapeBy(keyboardFastMoveDistance * -1, 0),
  //   });
  //
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'right',
  //     description: 'Move selected shape right',
  //     callback: () => this._moveSelectedShapeBy(keyboardMoveDistance, 0),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+right',
  //     description: 'Move selected shape right (fast)',
  //     callback: () => this._moveSelectedShapeBy(keyboardFastMoveDistance, 0),
  //   });
  //
  //   // @TODO: Only register if we are really working with a cuboid;
  //   this._registerCuboidShortcuts();
  // }
  //
  // _registerCuboidShortcuts() {
  //   const rotationDegrees = 2;
  //   const fastRotationDegrees = 10;
  //   const scaleDistance = 1;
  //   const fastScaleDistance = 6;
  //
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'o',
  //     description: `Rotate cuboid counter clockwise by ${rotationDegrees}°`,
  //     callback: () => this._rotateCuboid(this._deg2rad(rotationDegrees)),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'p',
  //     description: `Rotate cuboid clockwise by ${rotationDegrees}°`,
  //     callback: () => this._rotateCuboid(this._deg2rad(rotationDegrees * -1)),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+o',
  //     description: `Rotate cuboid counter clockwise by ${fastRotationDegrees}°`,
  //     callback: () => this._rotateCuboid(this._deg2rad(fastRotationDegrees)),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+p',
  //     description: `Rotate cuboid clockwise by ${fastRotationDegrees}°`,
  //     callback: () => this._rotateCuboid(this._deg2rad(fastRotationDegrees * -1)),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'i',
  //     description: 'Change cuboid faces counter clockwise',
  //     callback: () => this._rotateCuboidFaces(false),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'u',
  //     description: 'Change cuboid faces clockwise',
  //     callback: () => this._rotateCuboidFaces(true),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '8',
  //     description: `Add approx. ${scaleDistance}px to cuboid height`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '2',
  //     description: `Substract approx. ${scaleDistance}px from cuboid height`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, scaleDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+8',
  //     description: `Add approx. ${fastScaleDistance}px to cuboid height`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+2',
  //     description: `Substract approx. ${fastScaleDistance}px from cuboid height`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.HEIGHT, fastScaleDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '4',
  //     description: `Add approx. ${scaleDistance}px to cuboid width`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '6',
  //     description: `Substract approx. ${scaleDistance}px from cuboid width`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, scaleDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+4',
  //     description: `Add approx. ${fastScaleDistance}px to cuboid width`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+6',
  //     description: `Substract approx. ${fastScaleDistance}px from cuboid width`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.WIDTH, fastScaleDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '9',
  //     description: `Add approx. ${scaleDistance}px to cuboid depth`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: '3',
  //     description: `Substract approx. ${scaleDistance}px from cuboid depth`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, scaleDistance * -1),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+9',
  //     description: `Add approx. ${fastScaleDistance}px to cuboid depth`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance),
  //   });
  //   this._keyboardShortcutService.addHotkey('labeling-task', {
  //     combo: 'shift+3',
  //     description: `Substract approx. ${fastScaleDistance}px from cuboid depth`,
  //     callback: () => this._resizeCuboidByDistance(CuboidInteractionResolver.DEPTH, fastScaleDistance * -1),
  //   });
  // }

  // _resizeCuboidByDistance(handleName, distance) {
  //   /**
  //    * @type {PaperCuboid}
  //    */
  //   const cuboid = this._toolActionStruct.shape;
  //   if (!(cuboid instanceof PaperCuboid)) {
  //     return;
  //   }
  //
  //   const minimalHeight = (
  //     this._$scope.vm.task.drawingToolOptions.cuboid &&
  //     this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight &&
  //     this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight > 0
  //   )
  //     ? this._$scope.vm.task.drawingToolOptions.cuboid.minimalHeight
  //     : 1;
  //
  //   this._context.withScope(scope => {
  //     cuboid.resizeByDistance(handleName, distance, minimalHeight);
  //     scope.view.update();
  //     this.emit('shape:update', cuboid);
  //   });
  // }
  //
  // /**
  //  * Converts degree to radiant
  //  *
  //  * @param degree
  //  * @returns {number}
  //  * @private
  //  */
  // _deg2rad(degree) {
  //   return 2 * Math.PI / 360 * degree;
  // }
  //
  // // enable() {
  // //   this._enabled = true;
  // //   this._keyboardShortcutService.enable();
  // // }
  //
  // // disable() {
  // //   this._enabled = false;
  // //   this._keyboardShortcutService.disable();
  // // }
  //
  // /**
  //  * @param {number} degree
  //  * @private
  //  */
  // _rotateCuboid(degree) {
  //   // TODO: refactor this into a separate cuboid-rotate tool !!!
  //   const shape = this._toolActionStruct.shape;
  //   if (shape instanceof PaperCuboid) {
  //     this._context.withScope(scope => {
  //       shape.rotateAroundCenter(degree);
  //       shape.updatePrimaryCorner();
  //       scope.view.update();
  //       // this.emit('shape:update', shape);
  //     });
  //   }
  // }
  //
  // /**
  //  * @param {boolean} clockwise
  //  * @private
  //  */
  // _rotateCuboidFaces(clockwise) {
  //   // TODO: refactor this into a separate cuboid-rotate tool !!!
  //   const shape = this._$scope.vm.selectedPaperShape;
  //   if (shape instanceof PaperCuboid) {
  //     this._context.withScope(scope => {
  //       shape.rotateFaces(clockwise);
  //       shape.updatePrimaryCorner();
  //       scope.view.update();
  //       this.emit('shape:update', shape);
  //     });
  //   }
  // }
  //
  // /**
  //  * @param {Number} deltaX
  //  * @param {Number} deltaY
  //  * @private
  //  */
  // _moveSelectedShapeBy(deltaX, deltaY) {
  //   if (!this._enabled) {
  //     return;
  //   }
  //
  //   const paperShape = this._$scope.vm.selectedPaperShape;
  //   if (!paperShape) {
  //     return;
  //   }
  //
  //   this._context.withScope(scope => {
  //     paperShape.moveTo(
  //       new paper.Point(
  //         paperShape.position.x + deltaX,
  //         paperShape.position.y + deltaY
  //       ),
  //       this._options
  //     );
  //     scope.view.update();
  //     this.emit('shape:update', paperShape);
  //   });
  // }
}

MultiTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'keyboardShortcutService',
  'toolService',
  'viewerMouseCursorService',
];

export default MultiTool;

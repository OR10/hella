import PaperTool from './PaperTool';
import paper from 'paper';
import PaperRectangle from '../../Viewer/Shapes/PaperRectangle';
import PaperPedestrian from '../../Viewer/Shapes/PaperPedestrian';
import PaperCuboid from '../../ThirdDimension/Shapes/PaperCuboid';
import PaperPolygon from '../../Viewer/Shapes/PaperPolygon';
import CuboidInteractionResolver from '../../ThirdDimension/Support/CuboidInteractionResolver';
import hitResolver from '../Support/HitResolver';

import CreationToolActionStruct from './ToolActionStructs/CreationToolActionStruct';
import MovingToolActionStruct from './ToolActionStructs/MovingToolActionStruct';
import ScalingToolActionStruct from './ToolActionStructs/ScalingToolActionStruct';
import KeyboardToolActionStruct from './ToolActionStructs/KeyboardToolActionStruct';

/**
 * A multi tool for handling multiple functionalities
 * Extends Tool and not Mutation- or CreationTool as it implements both interfaces which can't be interfaces due to lack
 * of javascript capabilities.
 *
 * @extends Tool
 */
class MultiTool extends PaperTool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$rootScope.Scope} $scope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {ToolService} toolService
   * @param {ViewerMouseCursorService} viewerMouseCursorService
   */
  constructor(drawingContext, $scope, $q, loggerService, toolService, viewerMouseCursorService) {
    super(drawingContext, $scope, $q, loggerService);

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
    this._activePaperTool = null;

    /**
     * Currently active keyboard tool
     * @type {KeyboardTool|null}
     * @private
     */
    this._keyboardTool = null;

    /**
     * @type {boolean}
     * @private
     */
    this._paperToolDelegationInvoked = false;

    /**
     * @type {boolean}
     * @private
     */
    this._keyboardToolDelegationInvoked = false;
  }

  /**
   * @param {MultiToolActionStruct} toolActionStruct
   * @return {Promise}
   */
  invoke(toolActionStruct) {
    const promise = this._invoke(toolActionStruct);
    this._activePaperTool = null;
    this._keyboardTool = null;
    this._paperToolDelegationInvoked = false;
    this._keyboardToolDelegationInvoked = false;
    // if (!this._readOnly) {
    //   // Register Keyboard shortcuts
    //   this._registerShortcuts();
    // }
    // this._initializeOptions(options);

    const {selectedPaperShape, requirementsShape} = this._toolActionStruct;
    if (selectedPaperShape !== null) {

      const keyboardTool = this._toolService.getTool(this._context, requirementsShape, 'keyboard');
      if (keyboardTool !== null) {
        this._invokeKeyboardToolDelegation(keyboardTool, selectedPaperShape);
      }
    }

    return promise;
  }

  /**
   * @private
   */
  abort() {
    if (this._paperToolDelegationInvoked) {
      this._paperToolDelegationInvoked = false;
      this._activePaperTool.abort();
    }

    if (this._keyboardToolDelegationInvoked) {
      this._keyboardToolDelegationInvoked = false;
      this._keyboardTool.abort();
    }

    super.abort();
  }

  /**
   * @private
   */
  _reject(reason) {
    if (this._keyboardToolDelegationInvoked) {
      this._keyboardToolDelegationInvoked = false;
      this._keyboardTool.abort();
    }

    super._reject(reason);
  }

  /**
   * @private
   */
  _complete(result) {
    if (this._keyboardToolDelegationInvoked) {
      this._keyboardToolDelegationInvoked = false;
      this._keyboardTool.abort();
    }

    super._complete(result);
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
    this._invokePaperToolDelegation(tool, 'creation', null, null);
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

    if (this._paperToolDelegationInvoked) {
      this._activePaperTool.onMouseDown(event);
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
        this._invokeCreationToolDelegation(this._toolActionStruct.requirementsShape);
        this._activePaperTool.onMouseDown(event);
        return;
      }

      // Hit something
      const [hitShape, hitHandle = null] = hitResolver.resolve(hitResult.item);
      const actionIdentifier = hitShape.getToolActionIdentifier(hitHandle);

      // Invoke mutation tool
      this._invokePaperToolDelegation(this._toolService.getTool(this._context, hitShape.getClass(), actionIdentifier), actionIdentifier, hitShape, hitHandle);
      this._activePaperTool.onMouseDown(event);
    });
  }

  /**
   * @param {KeyboardTool} tool
   * @param {PaperShape} shape
   * @private
   */
  _invokeKeyboardToolDelegation(tool, shape) {
    this._keyboardToolDelegationInvoked = true;
    const {viewport, delegatedOptions} = this._toolActionStruct;
    const struct = new KeyboardToolActionStruct(delegatedOptions, viewport, shape);
    const promise = tool.invokeKeyboardShortcuts(struct);
    this._keyboardTool = tool;

    promise.then(paperShape => {
      this._keyboardToolDelegationInvoked = false;
      if (this._paperToolDelegationInvoked) {
        this._activePaperTool.abort();
      }
      this._complete({actionIdentifier: 'keyboard', paperShape});
    });
  }

  /**
   * @param {Tool} tool
   * @param {string} actionIdentifier
   * @param {PaperShape} shape
   * @param {Handle} handle
   * @private
   */
  _invokePaperToolDelegation(tool, actionIdentifier, shape, handle) {
    this._paperToolDelegationInvoked = true;
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

    this._activePaperTool = tool;

    promise.then(paperShape => {
      this._paperToolDelegationInvoked = false;
      this._complete({actionIdentifier, paperShape});
    }).catch(reason => {
      this._paperToolDelegationInvoked = false;
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

    if (this._paperToolDelegationInvoked) {
      this._activePaperTool.onMouseMove(event);
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

    if (this._paperToolDelegationInvoked) {
      this._activePaperTool.onMouseUp(event);
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

    if (this._paperToolDelegationInvoked) {
      this._activePaperTool.onMouseDrag(event);
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

    return this._activePaperTool.invokeDefaultShapeCreation(struct);
  }


  // _registerShortcuts() {
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
  //   const {shape} = this._toolActionStruct;
  //   if (shape instanceof PaperCuboid) {
  //     this._context.withScope(scope => {
  //       shape.rotateFaces(clockwise);
  //       shape.updatePrimaryCorner();
  //       scope.view.update();
  //     });
  //       this.emit('shape:update', shape);
  //   }
  // }
  //
}

/**
 * Return the name of the tool. The name needs to be unique within the application.
 * Therefore something like a prefix followed by the className is advisable.
 *
 * @return {string}
 * @public
 * @abstract
 * @static
 */
MultiTool.getToolName = function () {
  return 'MultiTool';
};

/**
 * Check if the given ShapeClass ({@link PaperShape#getClass}) is supported by this Tool.
 *
 * It specifies mostly which shape is affected by the given tool (eg. `rectangle`, `cuboid`, `multi`, ...)
 *
 * There maybe multiple Tools with the same name, but different action identifiers. (`rectangle` and ´move`,
 * `rectangle` and `scale`, ...)
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
MultiTool.isShapeClassSupported = function (shapeClass) {
  return [
    'multi',
  ].includes(shapeClass);
};

/**
 * Check if the given actionIdentifer is supported by this tool.
 *
 * Currently supported actions are:
 * - `creating`
 * - `scale`
 * - `move`
 *
 * @return {bool}
 * @public
 * @abstract
 * @static
 */
MultiTool.isActionIdentifierSupported = function (actionIdentifier) {
  return [
    'creation',
    'move',
    'scale',
  ].includes(actionIdentifier);
};

MultiTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'toolService',
  'viewerMouseCursorService',
];

export default MultiTool;

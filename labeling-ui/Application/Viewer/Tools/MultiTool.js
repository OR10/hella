import PaperTool from './PaperTool';
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
        // Deselction if there was a selection
        if (this._toolActionStruct.selectedPaperShape !== null) {
          this._complete({actionIdentifier: 'selection', paperShape: null});
          return;
        }
        // Invoke shape creation
        this._invokeCreationToolDelegation(this._toolActionStruct.requirementsShape);
        this._activePaperTool.onMouseDown(event);
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

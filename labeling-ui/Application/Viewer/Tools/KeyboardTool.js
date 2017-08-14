import Tool from './NewTool';
import {debounce} from 'lodash';

/**
 * Base class of Tools providing keyboard shortcuts
 * @abstract
 */
class KeyboardTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {$scope} $rootScope
   * @param {$q} $q
   * @param {LoggerService} loggerService
   * @param {KeyboardShortcutService} keyboardShortcutService
   * @param {EntityIdService} entityIdService
   */
  constructor(drawingContext, $rootScope, $q, loggerService, keyboardShortcutService, entityIdService) {
    super(drawingContext, $rootScope, $q, loggerService);

    /**
     * @type {KeyboardShortcutService}
     * @private
     */
    this._keyboardShortcutService = keyboardShortcutService;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {string|null}
     * @private
     */
    this._keyboardShortcutOverlayIdentifier = null;
  }

  /**
   * @param {KeyboardToolActionStruct} keyboardToolActionStruct
   */
  invokeKeyboardShortcuts(keyboardToolActionStruct) {
    const promise = this._invoke(keyboardToolActionStruct);
    this._initializeKeyboardShortcuts();
    return promise;
  }

  /**
   * Cancel all current tool actions and clean up the state.
   *
   * @param {*} reason
   * @protected
   */
  _reject(reason) {
    if (this._invoked === true) {
      this._cleanUpKeyboardShortcuts();
      super._reject(reason);
    }
  }

  /**
   * Internal function that is called after the tool workflow has finished
   *
   * @param {*} result
   * @return {Promise}
   * @protected
   */
  _complete(result) {
    if (this._invoked === true) {
      this._cleanUpKeyboardShortcuts();
      return super._complete(result);
    }
  }

  /**
   * @private
   */
  _initializeKeyboardShortcuts() {
    if (this._keyboardShortcutOverlayIdentifier !== null) {
      this._cleanUpKeyboardShortcuts();
    }

    this._keyboardShortcutOverlayIdentifier = this._generateNewKeyboardShortcutOverlayIdentifier();
    this._keyboardShortcutService.registerOverlay(this._keyboardShortcutOverlayIdentifier, false);
  }

  /**
   * @private
   */
  _cleanUpKeyboardShortcuts() {
    if (this._keyboardShortcutOverlayIdentifier !== null) {
      this._keyboardShortcutService.removeOverlayById(this._keyboardShortcutOverlayIdentifier);
      this._keyboardShortcutOverlayIdentifier = null;
    }
  }

  /**
   * @returns {string}
   * @private
   */
  _generateNewKeyboardShortcutOverlayIdentifier() {
    const staticSelf = this.constructor;
    return `${staticSelf.getToolName()}-${this._entityIdService.getUniqueId()}`;
  }

  /**
   * @param {string} combo
   * @param {string} description
   * @param {Function} callback
   * @protected
   */
  _registerKeyboardShortcut(combo, description, callback) {
    this._keyboardShortcutService.addHotkey(
      this._keyboardShortcutOverlayIdentifier,
      {
        callback: (...args) => {
          callback(...args);
          this._complete( this._toolActionStruct.shape);
        },
        combo,
        description,
      }
    );
  }
}

KeyboardTool.$inject = [
  'drawingContext',
  '$rootScope',
  '$q',
  'loggerService',
  'keyboardShortcutService',
  'entityIdService',
];

export default KeyboardTool;

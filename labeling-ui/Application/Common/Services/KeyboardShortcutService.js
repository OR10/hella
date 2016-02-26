/**
 * Service for wrapping the hotkeys library in oder to provide contexts
 * and other convenience functions
 */
class KeyboardShortcutService {
  constructor(hotkeys, logger) {
    /**
     * @private
     */
    this._hotkeys = hotkeys;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {Map}
     * @private
     */
    this._contexts = new Map();

    /**
     * @type {Array<string>}
     * @private
     */
    this._contextStack = [];
  }

  /**
   * Add a new hotkey to the provided context
   *
   * @param {string} context
   * @param {Object} hotkeyConfig
   */
  addHotkey(context, hotkeyConfig) {
    if (this._contexts.has(context)) {
      this._contexts.set(context, [hotkeyConfig, ...this._contexts.get(context)]);
    } else {
      this._contexts.set(context, [hotkeyConfig]);
    }

    // Allow activation of context before addition of hotkeys
    if (this._contextStack.length > 0 && this._contextStack[this._contextStack.length - 1] === context) {
      this._hotkeys.add(hotkeyConfig);
    }
  }

  /**
   * Activate the provided context and all the
   * @param {string} context
   */
  pushContext(context) {
    this._logger.log('keyboardShortcutService:context', `Activating context '${context}'`);

    this._deactivateAllHotkeys();
    this._activateHotkeysForContext(context);
    this._contextStack.push(context);
  }

  /**
   * Deactivate the currently active context and activate the previous context
   */
  popContext() {
    this._logger.log('keyboardShortcutService:context', `Deactivating current context (${this._contextStack[this._contextStack.length - 1]})`);
    if (this._contextStack.length <= 0) {
      throw new Error('There is no context to deactivate!');
    }
    this._deactivateHotkeysForContext(this._contextStack.pop());

    if (this._contextStack.length > 0) {
      this._activateHotkeysForContext(this._contextStack[this._contextStack.length - 1]);
    }
  }

  clearContext(context) {
    this._logger.log('keyboardShortcutService:context', `Clear context '${context}'`);
    this._contextStack = this._contextStack.filter(
      stackedContext => stackedContext !== context
    );
    this._deactivateAllHotkeys();
    if (this._contextStack.length > 0) {
      this._activateHotkeysForContext(this._contextStack.length - 1);
    }

    this._contexts.delete(context);
  }

  /**
   * Deactivate all hotkeys
   *
   * @private
   */
  _deactivateAllHotkeys() {
    this._contexts.forEach((hotkeys, context) =>
      this._deactivateHotkeysForContext(context)
    );
  }

  /**
   * Deactivate all hotkeys for a context
   *
   * @param {string} context
   * @private
   */
  _deactivateHotkeysForContext(context) {
    const hotkeys = this._contexts.get(context);
    if (hotkeys === undefined) {
      return;
    }

    hotkeys.forEach(
      hotkey => this._hotkeys.del(hotkey.combo)
    );
  }

  /**
   * Activate all hotkeys for a context
   *
   * @param {string} context
   * @private
   */
  _activateHotkeysForContext(context) {
    const hotkeys = this._contexts.get(context);
    if (hotkeys === undefined) {
      return;
    }

    hotkeys.forEach(
      hotkey => this._hotkeys.add(hotkey)
    );
  }
}

KeyboardShortcutService.$inject = ['hotkeys', 'loggerService'];

export default KeyboardShortcutService;
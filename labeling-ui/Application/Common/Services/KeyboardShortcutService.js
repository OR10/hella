/**
 * Service for wrapping the hotkeys library in oder to provide contexts
 * and other convenience functions
 */
class KeyboardShortcutService {
  constructor(hotkeys) {
    /**
     * @private
     */
    this._hotkeys = hotkeys;

    /**
     * @type {Map}
     * @private
     */
    this._contexts = new Map();

    /**
     * @type {Array<string>}
     * @private
     */
    this._contextStack = new Array();
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
  }

  /**
   * Activate the provided context and all the
   * @param {string} context
   */
  activateContext(context) {
    if (!this._contexts.has(context)) {
      throw new Error(`There is no context with the Identifier '${context}' to activate!`)
    }
    console.log('activate context: ', context);
    console.log(this._contexts);
    this._deactivateAllHotkeys();
    this._activateHotkeysForContext(context);
    this._contextStack.push(context);
  }

  /**
   * Deactivate the currently active context and activate the previous context
   */
  deactivateActiveContext() {
    if (this._contextStack.length <= 0) {
      throw new Error('There is no context to deactivate!');
    }
    this._deactivateHotkeysForContext(this._contextStack.pop());
    this._activateCurrentContext();
  }

  deleteContext(context) {
    this._contexts.delete(context);
  }

  /**
   * Deactivate all hotkeys
   *
   * @private
   */
  _deactivateAllHotkeys() {
    if (this._contexts.length <= 0) {
      throw new Error('There is no context to deactivate!')
    }
    this._contexts.forEach((val, context) => {
      this._deactivateHotkeysForContext(context);
    });
  }

  /**
   * Deactivate all hotkeys for a context
   *
   * @param {string} context
   * @private
   */
  _deactivateHotkeysForContext(context) {
    this._contexts.get(context).forEach((hotkey)=> this._hotkeys.del(hotkey.combo));
  }

  /**
   * Activate all hotkeys for a context
   *
   * @param {string} context
   * @private
   */
  _activateHotkeysForContext(context) {
    this._contexts.get(context).forEach((hotkey) => this._hotkeys.add(hotkey));
  }

  /**
   * Activate the hotkeys for the current context
   *
   * @private
   */
  _activateCurrentContext() {
    const currentContext = this._contextStack[this._contextStack.length - 1];
    this.activateContext(currentContext);
  }
}

KeyboardShortcutService.$inject = ['hotkeys'];

export default KeyboardShortcutService;
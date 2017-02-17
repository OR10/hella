/**
 * Service for wrapping the hotkeys library in oder to provide contexts
 * and other convenience functions
 */
class KeyboardShortcutService {
  /**
   * @param {hotkeys} hotkeys
   * @param {Logger} logger
   */
  constructor(hotkeys, logger) {
    /**
     * @type {hotkeys}
     * @private
     */
    this._hotkeys = hotkeys;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {Array.<{id: string, hotkeyConfigs: Array.<Object>, blocking: boolean}>}
     * @private
     */
    this._overlays = [];

    /**
     * @type {boolean}
     * @private
     */
    this._disabled = false;
  }

  /**
   * Disable all current hotkeys
   */
  disable() {
    if (!this._disabled) {
      this._deleteAllHotkeys();
      this._disabled = true;
    }
  }

  /**
   * Enable the last active context
   */
  enable() {
    if (this._disabled) {
      this._registerAllHotkeys();
      this._disabled = false;
    }
  }

  /**
   * Add a new hotkey to the provided overlay
   *
   * @param {string} overlayIdentifier
   * @param {Object} hotkeyConfig
   */
  addHotkey(overlayIdentifier, hotkeyConfig) {
    const overlay = this._overlays.find(
      candidate => candidate.id === overlayIdentifier
    );

    if (overlay === undefined) {
      throw new Error(`Hotkey overlay with id '${overlayIdentifier}' is not registered`);
    }

    this._logger.log('keyboardShortcut:hotkey', `Registered hotkey ${hotkeyConfig.combo} in overlay ${overlayIdentifier}`);
    overlay.hotkeyConfigs.push(hotkeyConfig);
    this._refreshAllHotkeys();
  }

  /**
   * @param {string} id
   * @param {boolean} blocking
   */
  registerOverlay(id, blocking = false) {
    this._logger.log('keyboardShortcut:overlay', `Registered ${blocking ? "blocking" : "non blocking"} overlay '${id}'`);
    this._overlays.unshift({
      hotkeyConfigs: [],
      id,
      blocking
    });
  }

  removeOverlayById(overlayIdentifier) {
    this._logger.log('keyboardShortcut:overlay', `Remove overlay by id '${overlayIdentifier}'`);
    this._overlays = this._overlays.filter(
      overlay => overlay.id !== overlayIdentifier
    );

    this._refreshAllHotkeys();
  }

  /**
   * @private
   */
  _refreshAllHotkeys() {
    this._deleteAllHotkeys();
    this._registerAllHotkeys();
  }

  /**
   * @private
   */
  _deleteAllHotkeys() {
    this._overlays.forEach(
      overlay => this._deleteHotkeysForOverlay(overlay)
    );
  }

  /**
   * @param {{id: string, hotkeyConfigs: Array.<Object>, blocking: boolean}} overlay
   * @private
   */
  _deleteHotkeysForOverlay(overlay) {
    overlay.hotkeyConfigs.forEach(
      hotkeyConfig => {
        this._logger.log('keyboardShortcut:debug', `Deactivating shortcut ${hotkeyConfig.combo}`);
        this._hotkeys.del(hotkeyConfig.combo);
      }
    );
  }

  /**
   * @private
   */
  _registerAllHotkeys() {
    const firstBlockerIndex = this._overlays.findIndex(
      (overlay, index) => overlay.blocking === true || index === this._overlays.length - 1
    );
    this._overlays
      .slice(0, firstBlockerIndex + 1)
      .forEach(
        overlay => this._registerHotkeysForOverlay(overlay)
      );
  }

  /**
   * @param {{id: string, hotkeyConfigs: Array.<Object>, blocking: boolean}} overlay
   * @private
   */
  _registerHotkeysForOverlay(overlay) {
    overlay.hotkeyConfigs.forEach(
      hotkeyConfig => {
        this._logger.log('keyboardShortcut:debug', `Activating shortcut ${hotkeyConfig.combo}`);
        this._hotkeys.add(hotkeyConfig);
      }
    );
  }
}

KeyboardShortcutService.$inject = ['hotkeys', 'loggerService'];

export default KeyboardShortcutService;

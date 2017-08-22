const readline = require('readline');

class KeyboardShortcutService {
  constructor() {
    /**
     * @type {Map.<string, Function[]>}
     * @private
     */
    this._registeredHandlers = new Map();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => this._onKeypress(str, key));
  }

  register(shortcut, callback) {
    if (!this._registeredHandlers.has(shortcut)) {
      this._registeredHandlers.set(shortcut, []);
    }

    const callbacks = this._registeredHandlers.get(shortcut);
    callbacks.push(callback);
  }

  _onKeypress(str, key) {
    const shortcut = this._buildShortcutString(key);
    if (!this._registeredHandlers.get(shortcut)) {
      return;
    }

    const callbacks = this._registeredHandlers.get(shortcut);
    callbacks.forEach(callback => callback());
  }

  _buildShortcutString(key) {
    let shortcut = '';
    if (key.ctrl === true) {
      shortcut += 'ctrl-';
    }
    if (key.meta === true) {
      shortcut += 'meta-';
    }
    if (key.shift === true) {
      shortcut += 'shift-';
    }

    shortcut += key.name;

    return shortcut;
  }
}

exports.KeyboardShortcutService = KeyboardShortcutService;

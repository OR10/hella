const fse = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

class DebugInterface {
  /**
   * @param {Logger} logger
   * @param {string} directory
   */
  constructor(logger, directory) {
    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;

    /**
     * @type {string}
     * @private
     */
    this._directory = directory;

    /**
     * @type {chokidar|undefined}
     * @private
     */
    this._fileWatcher = undefined;

    /**
     * @type {Map.<string, Function[]>}
     * @private
     */
    this._commandHandlers = new Map();
  }

  /**
   * @returns {Promise}
   */
  initialize() {
    const directory = this._directory;

    return Promise.resolve()
      .then(() => fse.ensureDir(directory))
      .then(() => fse.emptyDir(`${directory}/control`))
      .then(() => {
        this._fileWatcher = chokidar.watch(`${directory}/control`);
        this._fileWatcher.on('add', filepath => {
          const commandName = path.basename(filepath);
          fse.remove(filepath); // returns promise, but no need to wait.
          this._onCommand(commandName);
        });
      });
  }
  
  on(commandName, callback) {
    if (!this._commandHandlers.has(commandName)) {
      this._commandHandlers.set(commandName, []);
    }

    const callbacks = this._commandHandlers.get(commandName);
    callbacks.push(callback);
  }

  writeJson(target, id, document) {
    const fullTargetDir = `${this._directory}/${target}`;
    const fullTargetFile = `${fullTargetDir}/${id}.json`;

    return Promise.resolve()
      .then(() => fse.emptyDir(fullTargetDir))
      .then(() => fse.writeJson(fullTargetFile, document, {spaces: 2}));
  }

  _onCommand(commandName) {
    if (!this._commandHandlers.has(commandName)) {
      return
    }

    this._logger.logString(`DEBUG: Executing command "${commandName}"`);
    const callbacks = this._commandHandlers.get(commandName);
    callbacks.forEach(callback => callback());
  }
}

exports.DebugInterface = DebugInterface;

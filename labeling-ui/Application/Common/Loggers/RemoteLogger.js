import uuid from 'uuid';

/**
 * @implements Logger
 */
class RemoteLogger {

  /**
   * @param {LogGateway} logGateway
   * @param {User} user
   */
  constructor(logGateway, user) {
    /**
     * @type {LogGateway}
     * @private
     */
    this._logGateway = logGateway;

    /**
     * @type {User}
     * @private
     */
    this._user = user;

    /**
     * @type {uuid}
     * @private
     */
    this._groupId = null;
  }

  log(context, ...args) { // eslint-disable-line no-unused-vars
    // Backend currently only saves messages with a level of at least warning
    // this._log('info', context, args);
  }

  warn(context, ...args) {
    this._log('warning', context, args);
  }

  error(context, ...args) {
    this._log('error', context, args);
  }

  _log(level, context, args) {
    const {appCodeName, appName, appVersion, language, platform, product, userAgent, vendor} = navigator;

    const trace = new Error().stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');

    const logEntry = {
      context,
      level,
      browser: {appCodeName, appName, appVersion, language, platform, product, userAgent, vendor},
      group: this._groupId,
      data: JSON.stringify(args),
      user: this._user,
      trace,
    };

    this._logGateway.logMessage(logEntry);
  }

  groupStart(context, ...args) { // eslint-disable-line no-unused-vars
    this._groupId = uuid.v4();
  }

  groupStartOpened(context, ...args) { // eslint-disable-line no-unused-vars
    this._groupId = uuid.v4();
  }

  groupEnd(context) { // eslint-disable-line no-unused-vars
    this._groupId = null;
  }
}

export default RemoteLogger;

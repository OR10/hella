import uuid from 'uuid';

/**
 * @implements Logger
 */
class RemoteLogger {

  /**
   * @param {LogGateway} logGateway
   */
  constructor(logGateway) {
    /**
     * @type {LogGateway}
     * @private
     */
    this._logGateway = logGateway;

    /**
     * @type {uuid}
     * @private
     */
    this._groupId = null;
  }

  log(context, ...args) {
    // Backend currently only saves messages with a level of at least warning
    // this._log('info', context, args);
  }

  warn(context, ...args) {
    this._log('warning', context, args);
  }

  _log(level, context, args) {
    const {appCodeName, appName, appVersion, language, platform, product, userAgent, vendor} = navigator;
    const logEntry = {
      context,
      level,
      browser: {appCodeName, appName, appVersion, language, platform, product, userAgent, vendor},
      group: this._groupId,
      data: args,
      trace: new Error().stack,
    };

    this._logGateway.logMessage(logEntry);
  }

  groupStart(context, ...args) { // eslint-disable-line no-unused-vars
    this._groupId = uuid.v4();
  }

  groupEnd(context) { // eslint-disable-line no-unused-vars
    this._groupId = null;
  }
}

export default RemoteLogger;

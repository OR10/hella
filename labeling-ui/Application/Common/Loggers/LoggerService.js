/**
 * Logger Service usable by any component to properly log out information
 *
 * @implements Logger
 */
class LoggerService {
  constructor(contexts, loggers) {
    this._contexts = contexts;
    this._loggers = loggers;
  }

  /**
   * @param {Logger} logger
   */
  addLogger(logger) {
    this._loggers.push(logger);
  }

  log(context, ...args) {
    this._dispatch('log', context, ...args);
  }

  warn(context, ...args) {
    this._dispatch('warn', context, ...args);
  }

  groupStart(context, ...args) {
    this._dispatch('groupStart', context, ...args);
  }

  groupStartOpened(context, ...args) {
    this._dispatch('groupStartOpened', context, ...args);
  }

  groupEnd(context) {
    this._dispatch('groupEnd', context);
  }

  _isInContext(inContext) {
    return this._contexts.reduce((found, context) => {
      if (found === true) {
        return found;
      }

      const matcher = this._prepareAsRegexp(context);
      return matcher.test(inContext);
    }, false);
  }

  _dispatch(fn, context, ...args) {
    if (this._isInContext(context)) {
      this._loggers.forEach(logger => logger[fn](context, ...args));
    }
  }

  _prepareAsRegexp(value) {
    const pattern = value
      .replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&')
      .replace(/\*/g, '.*?');

    return new RegExp(`^${pattern}\$`);
  }
}

LoggerService.$inject = [
];

export default LoggerService;

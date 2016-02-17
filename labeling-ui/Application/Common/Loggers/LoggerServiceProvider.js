import LoggerService from './LoggerService';

class LoggerServiceProvider {
  constructor() {
    this._loggers = [];
    this._contexts = [];
  }

  registerLogger(logger) {
    this._loggers.push(logger);
  }

  addContexts(...contexts) {
    contexts.forEach(context => this._contexts.push(context));
  }

  $get() {
    if (!!window && !!window.__karma__) {
      return new LoggerService([], []);
    }
    return new LoggerService(this._contexts, this._loggers);
  }
}

LoggerServiceProvider.$inject = [
];

export default LoggerServiceProvider;

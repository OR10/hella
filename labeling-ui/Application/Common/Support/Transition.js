export default class Transition {
  constructor(sourceTextualState, targetTextualState) {
    this._sourceTextualState = sourceTextualState;
    this._targetTextualState = targetTextualState;

    this._executeHandlers = new Set();
  }

  register(handler) {
    this._executeHandlers.add(handler);
  }

  getHandlers() {
    return this._executeHandlers;
  }

  transition(...args) {
    this._executeHandlers.forEach(
      handler => handler(this._sourceTextualState, this._targetTextualState, ...args)
    );
  }
}
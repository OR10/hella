export default class Transition {
  constructor(sourceState, transitionValue, targetState) {
    this._sourceState = sourceState;
    this._transitionValue = transitionValue;
    this._targetState = targetState;
    this._executeHandlers = new Set();
  }

  register(handler) {
    this._executeHandlers.add(handler);
  }

  getHandlers() {
    return this._executeHandlers;
  }

  getTransitionValue() {
    return this._transitionValue;
  }

  transition(...args) {
    const transitionEvent = {
      from: this._sourceState.getName(),
      on: this._transitionValue,
      to: this._targetState.getName(),
    };

    this._executeHandlers.forEach(
      handler => handler(
        transitionEvent,
        ...args
      )
    );

    return this._targetState;
  }
}

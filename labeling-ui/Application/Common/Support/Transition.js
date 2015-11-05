export default class Transition {
  constructor(sourceState, transitionValue, targetState) {
    this._sourceState = sourceState;
    this._transitionValue = transitionValue;
    this._targetState = targetState;
  }

  getTransitionValue() {
    return this._transitionValue;
  }

  transition(...args) {
    const transitionEvent = {
      from: this._sourceState.getName(),
      on: this._transitionValue,
      to: this._targetState.getName()
    };

    this._targetState.transition(transitionEvent, ...args);
    return this._targetState;
  }
}
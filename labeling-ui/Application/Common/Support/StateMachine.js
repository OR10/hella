import State from './State';

export default class StateMachine {
  constructor(states) {
    if (!states.length) {
      throw new Error('A StateMachine can not be created with 0 states.');
    }

    this._stateMapping = new Map();
    states.forEach(
      textualState => this._stateMapping.set(textualState, new State(textualState))
    );

    this._currentState = null;
  }

  getState(textualState) {
    if (!this._stateMapping.has(textualState)) {
      throw new Error(`Unknown state ${textualState} from StateMachine requested`);
    }

    return this._stateMapping.get(textualState);
  }

  from(textualState) {
    return this.getState(textualState);
  }

  transition(targetTextualState, ...args) {
    if (this._currentState === null) {
      this._currentState = this.getState(targetTextualState);
      return;
    }

    const sourceState = this._currentState;
    sourceState.transition(targetTextualState, ...args);
    this._currentState = this.getState(targetTextualState);
  }
}

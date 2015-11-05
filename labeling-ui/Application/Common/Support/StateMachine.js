import State from './State';

export default class StateMachine {
  constructor(states, initialState = states[0]) {
    if (!states.length) {
      throw new Error('A StateMachine can not be created with 0 states.');
    }

    this._stateMapping = new Map();
    states.forEach(
      textualState => this._stateMapping.set(textualState, new State(this, textualState))
    );

    this._currentState = this._stateMapping.get(initialState);
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

  transition(transitionValue, ...args) {
    const sourceState = this._currentState;
    const targetState = sourceState.transition(transitionValue, ...args);
    this._currentState = targetState;
  }
}

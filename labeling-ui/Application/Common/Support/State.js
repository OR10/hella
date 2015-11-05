import Transition from './Transition';

export default class State {
  constructor(machine, name) {
    this._machine = machine;
    this._name = name;
    this._transitionMapping = new Map();
  }

  getName() {
    return this._name;
  }

  addTransition(transition) {
    const transitionValue = transition.getTransitionValue();

    if (this._transitionMapping.has(transitionValue)) {
      throw new Error(`Only one transition per input value is allowed in the StateMachine: ${this._name}|${transitionValue} already defined`);
    }

    this._transitionMapping.set(transitionValue, transition);
  }

  getTransition(transitionValue) {
    if (!this._transitionMapping.has(transitionValue)) {
      throw new Error(`Can't retrieve transisiton ${this._name}|${transitionValue}. No transition is defined`);
    }

    return this._transitionMapping.get(transitionValue);
  }

  on(transitionValue) {
    const sourceTextualState = this._name;

    return {
      to: (targetTextualState) => {
        const sourceState = this._machine.getState(sourceTextualState);
        const targetState = this._machine.getState(targetTextualState);

        const transition = new Transition(sourceState, transitionValue, targetState);
        this.addTransition(transition);
        return transition;
      },
    };
  }

  transition(transitionValue, ...args) {
    return this.getTransition(transitionValue).transition(...args);
  }
}

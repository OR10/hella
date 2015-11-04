import Transition from './Transition';

export default class State {
  constructor(name) {
    this._name = name;
    this._transitionMapping = new Map();
  }

  addTransition(targetTextualState, transition) {
    if (!this._transitionMapping.has(targetTextualState)) {
      this._transitionMapping.set(targetTextualState, new Set());
    }

    const transitions = this._transitionMapping.get(targetTextualState);
    transitions.add(transition);
  }

  getTransitions(targetTextualState) {
    if (!this._transitionMapping.has(targetTextualState)) {
      throw new Error(`Can't retrieve transisitons from ${this._name} to ${targetTextualState}. No transition is defined`);
    }

    return this._transitionMapping.get(targetTextualState);
  }

  to(targetTextualState) {
    const transition = new Transition(this._name, targetTextualState);
    this.addTransition(targetTextualState, transition);
    return transition;
  }

  transition(targetTextualState, ...args) {
    const transitions = this.getTransitions(targetTextualState);

    transitions.forEach(
      transition => transition.transition(...args)
    );
  }
}

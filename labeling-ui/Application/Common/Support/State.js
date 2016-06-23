import Transition from './Transition';

/**
 * Representation of each State of a {@link StateMachine}
 */
class State {
  /**
   * @param {StateMachine} machine
   * @param {string} name
   */
  constructor(machine, name) {
    /**
     * @type {StateMachine}
     * @private
     */
    this._machine = machine;

    /**
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * Mapping of transitionValues to their corresponding {@link Transition}
     * @type {Map<string, Transition>}
     * @private
     */
    this._transitionMapping = new Map();
  }

  /**
   * Retrieve the string name representation of this State
   *
   * @returns {string}
   */
  getName() {
    return this._name;
  }

  /**
   * Add a specific {@link Transition} to the current State.
   *
   * Even though {@link Transition}s may be added directly using this method, usually it is
   * more advisable to utilize the {@link State#on} method create and add new {@link Transition}s.
   *
   * @param transition
   */
  addTransition(transition) {
    const transitionValue = transition.getTransitionValue();

    if (this._transitionMapping.has(transitionValue)) {
      throw new Error(`Only one transition per input value is allowed in the StateMachine: ${this._name}|${transitionValue} already defined`);
    }

    this._transitionMapping.set(transitionValue, transition);
  }

  /**
   * Retrieve a registered {@link Transition} associated with the given `transitionValue`.
   *
   * @param transitionValue
   * @returns {Transition}
   *
   * @throws {Error} if no associated {@link Transition} can be found for the corresponding transitionValue.
   */
  getTransition(transitionValue) {
    if (!this._transitionMapping.has(transitionValue)) {
      throw new Error(`Can't retrieve transisiton ${this._name}|${transitionValue}. No transition is defined`);
    }

    return this._transitionMapping.get(transitionValue);
  }

  /**
   * Shortcut to create and add a new {@link Transition} for the current State.
   *
   * The method provides a fluent API in order to instantiate and register a new {@link Transition}.
   *
   * Usually the API is to be used the following way:
   * ```
   * machine.from('stateName1').on('some-transition-value').to('stateName2');
   * ```
   *
   * The result of the `to(...)` method is the created and registered {@link Transition}
   *
   * The return value of this `on` method is an intermediate API Wrapper object, which only provides
   * a correctly configured `to` method in order to complete the operation.
   *
   * @param transitionValue
   * @returns {{to: to}}
   */
  on(transitionValue) {
    const sourceTextualState = this._name;

    return {
      to: targetTextualState => {
        const sourceState = this._machine.getState(sourceTextualState);
        const targetState = this._machine.getState(targetTextualState);

        const transition = new Transition(sourceState, transitionValue, targetState);
        this.addTransition(transition);
        return transition;
      },
    };
  }

  /**
   * Initiate a {@link Transition} based on a certain `transitionValue`
   *
   * Provided `...args` will simply be transfered to the registered callbacks in the end.
   *
   * @param {string} transitionValue
   * @param {Array<*>} args
   * @returns {State} the {@link State} the {@link StateMachine} transitioned to
   */
  transition(transitionValue, ...args) {
    return this.getTransition(transitionValue).transition(...args);
  }
}

export default State;

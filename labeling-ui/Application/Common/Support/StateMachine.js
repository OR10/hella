import State from './State';

/**
 * A basic Finite Automata State Machine implementation.
 *
 * This implementation is mainly used for workflow control.
 */
class StateMachine {
  /**
   * Create a new {@link StateMachine} with a specific set of {@link State}s.
   *
   * The needed {@link State}s for the given machine are automatically created based on a list of their names.
   * Therefore the `states` array is a list of strings naming all relevant states.
   *
   * The `initialState` is the name of the {@link State} the machine should be in once initialized.
   * The default value of `initialState` is the first defined state of the `states` array.
   *
   * @param {Array<string>} states
   * @param {string} initialState
   */
  constructor(states, initialState = states[0]) {
    if (!states.length) {
      throw new Error('A StateMachine can not be created with 0 states.');
    }

    /**
     * Mapping of state names to their respective {@link State} object representation
     *
     * @type {Map<string,State>}
     * @private
     */
    this._stateMapping = new Map();

    states.forEach(
      textualState => this._stateMapping.set(textualState, new State(this, textualState))
    );

    /**
     * The state the machine currently resides in
     *
     * @type {State}
     * @private
     */
    this._currentState = this._stateMapping.get(initialState);

    if (this._currentState === undefined) {
      throw new Error(`Can't use initial state ${initialState}, as it is not a defined state.`);
    }
  }

  /**
   * Retrieve a certain {@link State} based on its name
   *
   * @param {string} textualState
   * @returns {State}
   */
  getState(textualState) {
    if (!this._stateMapping.has(textualState)) {
      throw new Error(`Unknown state ${textualState} from StateMachine requested`);
    }

    return this._stateMapping.get(textualState);
  }

  /**
   * Alias for {@link StateMachine#getState} to provide a nicer API for transition definitions.
   *
   * See {@link State#on} for details about this API.
   *
   * @param {string} textualState
   * @returns {State}
   */
  from(textualState) {
    return this.getState(textualState);
  }

  /**
   * Initiate a transition from the currently active state based on a given `transitionValue`.
   *
   * Every further provided argument (`...args`) will be passed through to the callback functions
   * executed in the end.
   *
   * @param {string} transitionValue
   * @param {Array} args
   */
  transition(transitionValue, ...args) {
    const sourceState = this._currentState;
    const targetState = sourceState.transition(transitionValue, ...args);
    this._currentState = targetState;
  }
}

export default StateMachine;

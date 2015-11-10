/**
 * A certain Transition based on a `transitionValue` registered on {@link State}s of the {@link StateMachine}
 */
class Transition {
  /**
   * @param {State} sourceState
   * @param {string} transitionValue
   * @param {State} targetState
   */
  constructor(sourceState, transitionValue, targetState) {
    /**
     * @type {State}
     * @private
     */
    this._sourceState = sourceState;

    /**
     * @type {string}
     * @private
     */
    this._transitionValue = transitionValue;

    /**
     * @type {State}
     * @private
     */
    this._targetState = targetState;

    /**
     * Registered callbacks executed once the transition is used.
     *
     * @type {Set<Function>}
     * @private
     */
    this._executeHandlers = new Set();
  }

  /**
   * Register an arbitrary callback function called once the transition is used.
   *
   * @param {Function} handler
   */
  register(handler) {
    this._executeHandlers.add(handler);
  }

  /**
   * Get all callbacks currently registered for this `Transition`
   *
   * @returns {Set.<Function>}
   */
  getHandlers() {
    return this._executeHandlers;
  }

  /**
   * Retrieve the `transitionValue` this Transition is listening to.
   *
   * @returns {string}
   */
  getTransitionValue() {
    return this._transitionValue;
  }

  /**
   * Execute the transition action for this Transition
   *
   * All provided arguments (`...args`) will be passed through to the registered callbacks.
   *
   * @param {Array.<*>}args
   * @returns {State} the new state reached after the Transition has finished.
   */
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

export default Transition;

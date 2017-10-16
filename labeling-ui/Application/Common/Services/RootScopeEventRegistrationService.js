class RootScopeEventRegistrationService {
  /**
   * @param {$rootScope} $rootScope
   */
  constructor($rootScope) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {Map}
     * @private
     */
    this._registrations = new Map();
  }

  /**
   * @param {*} identifier
   * @param {string} event
   * @param {Function} eventHandler
   */
  register(identifier, event, eventHandler) {
    if (this.isTracking(identifier, event)) {
      this.deregister(identifier, event);
    }

    this._track(
      identifier,
      event,
      this._$rootScope.$on(event, eventHandler)
    );
  }

  /**
   * @param {*} identifier
   * @param {string} event
   * @param {Function} deregistrationFunction
   * @private
   */
  _track(identifier, event, deregistrationFunction) {
    let eventMap = this._registrations.get(identifier);
    if (eventMap === undefined) {
      eventMap = new Map();
      this._registrations.set(identifier, eventMap);
    }

    eventMap.set(event, deregistrationFunction);
  }

  /**
   * @param {*} identifier
   * @param {string|undefined} event
   * @returns {boolean}
   */
  isTracking(identifier, event = undefined) {
    const eventMap = this._registrations.get(identifier);
    if (eventMap === undefined) {
      return false;
    }

    if (event === undefined) {
      return true;
    }

    return eventMap.has(event);
  }

  /**
   * @param {*} identifier
   * @param {string|undefined} event
   * @returns {boolean}
   */
  deregister(identifier, event = undefined) {
    const eventMap = this._registrations.get(identifier);
    if (eventMap === undefined) {
      return false;
    }

    if (event === undefined) {
      eventMap.forEach(deregister => deregister());
      this._registrations.delete(identifier);
      return true;
    }

    const deregister = eventMap.get(event);
    if (deregister === undefined) {
      return false;
    }

    deregister();
    eventMap.delete(event);
    return true;
  }
}

RootScopeEventRegistrationService.$inject = [
  '$rootScope',
];

export default RootScopeEventRegistrationService;

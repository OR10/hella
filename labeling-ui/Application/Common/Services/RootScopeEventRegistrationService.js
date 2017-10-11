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

  _track(identifier, event, deregistrationFunction) {
    let eventMap = this._registrations.get(identifier);
    if (eventMap === undefined) {
      eventMap = new Map();
      this._registrations.set(identifier, eventMap);
    }

    eventMap.set(event, deregistrationFunction);
  }

  isTracking(identifier, event) {
    const eventMap = this._registrations.get(identifier);
    if (eventMap === undefined) {
      return false;
    }

    if (event === undefined) {
      return true;
    }

    return eventMap.has(event);
  }

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

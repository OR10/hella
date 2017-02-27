/**
 * Service to hold the currently active Organisation.
 *
 * The Organisation may be `null` in which case no active organisation is selected.
 */
class OrganisationService {
  /**
   * @param {$rootScope} $rootScope
   * @param {CurrentUserService} currentUserService
   */
  constructor($rootScope, currentUserService) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {CurrentUserService}
     * @private
     */
    this._currentUserService = currentUserService;

    /**
     * @type {Organisation|null}
     * @private
     */
    this._activeOrganisationId = null;

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._subscribers = [];
  }

  /**
   * @returns {string|null}
   */
  get() {
    return this._activeOrganisationId;
  }

  /**
   * @param {string} activeOrganisationId
   */
  set(activeOrganisationId) {
    if (this._activeOrganisationId === activeOrganisationId) {
      return;
    }

    const oldActiveOrganisationId = this._activeOrganisationId;
    this._activeOrganisationId = activeOrganisationId;
    this._subscribers.forEach(
      subscriberFn => this._$rootScope.$applyAsync(() => subscriberFn(this._activeOrganisationId, oldActiveOrganisationId))
    );
  }


  /**
   * Returns the {@link Organisation} model for the current set organisation id
   *
   * @return {Organisation}
   */
  getModel() {
    const organisationsForCurrentUser = this._currentUserService.getOrganisations();
    const activeOrganisation = organisationsForCurrentUser.find(
      candidate => candidate.id === this._activeOrganisationId
    );

    if (activeOrganisation === undefined) {
      throw new Error(`No Organisation with the Id ${this._activeOrganisationId} is available for User ${this._currentUserService.get().username}`);
    }

    return activeOrganisation;
  }

  /**
   * @param {Function} subscriberFn
   */
  subscribe(subscriberFn) {
    this._subscribers.push(subscriberFn);
  }

  /**
   * @param {Function} subscriberFn
   */
  unsubscribe(subscriberFn) {
    this._subscribers = this._subscribers.filter(
      candidate => candidate !== subscriberFn
    );
  }
}

OrganisationService.$inject = [
  '$rootScope',
  'currentUserService',
];

export default OrganisationService;

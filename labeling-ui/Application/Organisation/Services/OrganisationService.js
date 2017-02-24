/**
 * Service to hold the currently active Organisation.
 *
 * The Organisation may be `null` in which case no active organisation is selected.
 */
class OrganisationService {
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
     * @type {Organisation|null}
     * @private
     */
    this._activeOrganisation = null;

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._subscribers = [];
  }

  /**
   * @returns {Organisation|null}
   */
  get() {
    return this._activeOrganisation;
  }

  /**
   * @param {Organisation} activeOrganisation
   */
  set(activeOrganisation) {
    const oldActiveOrganisation = this._activeOrganisation;
    this._activeOrganisation = activeOrganisation;
    this._subscribers.forEach(
      subscriberFn => this._$rootScope.$apply(() => subscriberFn(this._activeOrganisation, oldActiveOrganisation))
    )
  }

  /**
   * Update Organisation using an organisationId.
   *
   * An exception is thrown, if the used id is no organisation of the currentUser.
   *
   * @param {string} organisationId
   */
  setById(organisationId) {
    const organisationsForCurrentUser = this._currentUserService.getOrganisations();
    const activeOrganisation = organisationsForCurrentUser.find(
      candidate => candidate.id === organisationId
    );

    if (activeOrganisation === undefined) {
      throw new Error(`No Organisation with the Id ${organisationId} is available for User ${this._currentUserService.get().username}`);
    }

    this.set(activeOrganisation);
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
];

export default OrganisationService;

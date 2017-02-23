/**
 * Service to hold the currently active Organisation.
 *
 * The Organisation may be `null` in which case no active organisation is selected.
 */
class OrganisationService {
  /**
   * Construct a new Service
   */
  constructor() {
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
      subscriberFn => subscriberFn(this._activeOrganisation, oldActiveOrganisation)
    )
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
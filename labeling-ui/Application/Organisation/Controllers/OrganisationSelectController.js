class OrganisationSelectController {
  /**
   * @param {$state} $state
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationRoutingService} organisationRoutingService
   */
  constructor($state, currentUserService, organisationRoutingService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {OrganisationRoutingService}
     * @private
     */
    this._organisationRoutingService = organisationRoutingService;

    /**
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = currentUserService.getOrganisations();

    /**
     * @type {User}
     */
    this.user = currentUserService.get();

    /**
     * @type {Object}
     */
    this.userPermissions = currentUserService.getPermissions();
  }
}

OrganisationSelectController.$inject = [
  '$state',
  'currentUserService',
  'organisationRoutingService',
];

export default OrganisationSelectController;

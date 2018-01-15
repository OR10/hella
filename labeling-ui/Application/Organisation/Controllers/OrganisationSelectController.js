class OrganisationSelectController {
  /**
   * @param {$state} $state
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationRoutingService} organisationRoutingService
   * @param {UserGateway} userGateway
   */
  constructor($state, currentUserService, organisationRoutingService, userGateway) {
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

    /**
     * @type {boolean}
     */
    this.loadingInProgress = true;

    userGateway.getCurrentUserOrganisations().then(
      userOrganisations => {
        currentUserService.setOrganisations(userOrganisations);
        this.organisationsOfCurrentUser = userOrganisations;
        this.loadingInProgress = false;
      }
    );
  }
}

OrganisationSelectController.$inject = [
  '$state',
  'currentUserService',
  'organisationRoutingService',
  'userGateway',
];

export default OrganisationSelectController;

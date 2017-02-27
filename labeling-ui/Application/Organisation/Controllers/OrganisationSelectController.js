class OrganisationSelectController {
  /**
   * @param {$state} $state
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   */
  constructor($state, currentUserService, organisationService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

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

  /**
   * @param {Organisation} organisation
   */
  gotoOrganisation(organisation) {
    this._organisationService.set(organisation.id);
    this._$state.go('labeling.projects.list');
  }
}

OrganisationSelectController.$inject = [
  '$state',
  'currentUserService',
  'organisationService',
];

export default OrganisationSelectController;
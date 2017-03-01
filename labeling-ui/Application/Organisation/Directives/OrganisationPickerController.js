class OrganisationPickerController {
  /**
   * @param {$rootScope} $scope
   * @param {$state} $state
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   * @param {OrganisationRoutingService} organisationRoutingService
   */
  constructor($scope, $state, currentUserService, organisationService, organisationRoutingService) {
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
     * @type {string}
     */
    this.activeOrganisation = this._findOrganisationById(organisationService.get());

    organisationService.subscribe(
      newOrganisationId => {
        this.activeOrganisation = this._findOrganisationById(newOrganisationId);
      }
    );
  }

  /**
   * Event handler for user based changes to the organisation selection.
   */
  onOrganisationSelected() {
    const selectedOrganisation = this.activeOrganisation;
    if (selectedOrganisation === null) {
      return;
    }

    this._organisationRoutingService.transistionToNewOrganisation(selectedOrganisation.id);
  }

  /**
   * @param organisationId
   * @return {Organisation}
   * @private
   */
  _findOrganisationById(organisationId) {
    return this.organisationsOfCurrentUser.find(
      candidate => candidate.id === organisationId
    );
  }
}

OrganisationPickerController.$inject = [
  '$scope',
  '$state',
  'currentUserService',
  'organisationService',
  'organisationRoutingService',
];

export default OrganisationPickerController;

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
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = currentUserService.getOrganisations();

    /**
     * @type {string}
     */
    this.activeOrganisation = this._findOrganisationById(organisationService.get());

    organisationService.subscribe(
      (newOrganisationId, oldOrganisationId) => {
        this.activeOrganisation = this._findOrganisationById(newOrganisationId);
      }
    );

    $scope.$watch('vm.activeOrganisation', (activeOrganisation, oldOrganisation) => {
      if (activeOrganisation === null) {
        return;
      }

      // Those seem to be different objects (maybe due to select model binding)
      // The id however is unique and can therefore be used for comparison.
      if (activeOrganisation.id === oldOrganisation.id) {
        return;
      }

      organisationRoutingService.transistionToNewOrganisation(activeOrganisation.id);
    });
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

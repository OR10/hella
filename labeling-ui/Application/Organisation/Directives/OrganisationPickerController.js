class OrganisationPickerController {
  /**
   * @param {$rootScope} $scope
   * @param {$state} $state
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   */
  constructor($scope, $state, currentUserService, organisationService) {
    /**
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = currentUserService.getOrganisations();

    /**
     * @type {string}
     */
    this.activeOrganisation = this._findOrganisationById(organisationService.get());

    organisationService.subscribe(
      newOrganisationId => this.activeOrganisation = this._findOrganisationById(newOrganisationId)
    );

    $scope.$watch('vm.activeOrganisation', (activeOrganisation, oldOrganisation) => {
      if (activeOrganisation === null) {
        return;
      }

      if (activeOrganisation === oldOrganisation) {
        return;
      }

      organisationService.set(activeOrganisation.id);
      $state.reload();
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
];

export default OrganisationPickerController;

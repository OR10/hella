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
    this.activeOrganisation = organisationService.get();
    organisationService.subscribe(newOrganisation => this.activeOrganisation = newOrganisation);

    $scope.$watch('vm.activeOrganisation', (activeOrganisation, oldOrganisation) => {
      if (activeOrganisation === null) {
        return;
      }

      if (activeOrganisation === oldOrganisation) {
        return;
      }

      console.warn('reloading due to picker change');
      organisationService.set(activeOrganisation);
      $state.reload();
    });
  }
}

OrganisationPickerController.$inject = [
  '$scope',
  '$state',
  'currentUserService',
  'organisationService',
];

export default OrganisationPickerController;

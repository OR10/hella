class OrganisationPickerController {
  /**
   * @param {$rootScope} $scope
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   */
  constructor($scope, currentUserService, organisationService) {
    /**
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = currentUserService.getOrganisations();

    /**
     * @type {string}
     */
    this.activeOrganisation = organisationService.get();
    organisationService.subscribe(newOrganisation => this.activeOrganisation = newOrganisation);

  }
}

OrganisationPickerController.$inject = [
  '$scope',
  'currentUserService',
  'organisationService',
];

export default OrganisationPickerController;

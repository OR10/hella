class OrganisationSelectController {
  /**
   * @param {CurrentUserService} currentUserService
   */
  constructor(currentUserService) {
    /**
     * @type {Array.<Organisation>}
     */
    this.organisationsOfCurrentUser = currentUserService.getOrganisations();

    this.user = currentUserService.get();
    this.userPermissions = currentUserService.getPermissions();
  }
}

OrganisationSelectController.$inject = [
  'currentUserService'
];

export default OrganisationSelectController;
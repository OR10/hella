class PageTitleController {
  /**
   *
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   */
  constructor(currentUserService, organisationService) {
    /**
     * @type {CurrentUserService}
     * @private
     */
    this._currentUserService = currentUserService;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

    if(this.title === undefined) {
      this.title = 'AnnoStation';
    }

    this.user = this._currentUserService.get();
    this.activeOrganisation = this._getActiveOrganisation();
  }

  /**
   * @return {Organisation}
   * @private
   */
  _getActiveOrganisation() {
    const organisations = this._currentUserService.getOrganisations();
    const activeOrganisationId = this._organisationService.get();
    return organisations.find(
      candidate => candidate.id === activeOrganisationId
    );
  }
}

PageTitleController.$inject = [
  'currentUserService',
  'organisationService',
];

export default PageTitleController;
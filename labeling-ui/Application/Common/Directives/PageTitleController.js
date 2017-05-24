class PageTitleController {
  /**
   *
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   */
  constructor(currentUserService, organisationService) {
    if(this.title === undefined) {
      this.title = 'AnnoStation';
    }

    this.user = currentUserService.get();

    const organisations = currentUserService.getOrganisations();
    const activeOrganisationId = organisationService.get();
    this.activeOrganisation = this._findOrganisationById(organisations, activeOrganisationId);
  }

  /**
   * @param organisationId
   * @return {Organisation}
   * @private
   */
  _findOrganisationById(organisations, organisationId) {
    return organisations.find(
      candidate => candidate.id === organisationId
    );
  }
}

PageTitleController.$inject = [
  'currentUserService',
  'organisationService',
];

export default PageTitleController;
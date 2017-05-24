import readableRoleFilterProvider from '../../ManagementBoard/Filters/ReadableRoleFilterProvider';

const getReadableRole = readableRoleFilterProvider();

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

    if (this.title === undefined) {
      this.title = 'AnnoStation';
    }

    this.user = this._currentUserService.get();
    this.activeOrganisation = this._getActiveOrganisation();
    this.roles = this._getUserRolesFlattened();
  }

  /**
   * Get the active Organisation for the logged in user
   *
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

  /**
   * Get all roles for the logged in user, flattened
   *
   * @returns {string}
   * @private
   */
  _getUserRolesFlattened() {
    const omitRoles = ['ROLE_USER'];

    const readableRoles = [];
    const roles = this._currentUserService.getRoles();

    roles.forEach(role => {
      if (omitRoles.indexOf(role) === -1) {
        readableRoles.push(getReadableRole(role));
      }
    });

    return readableRoles.join(', ');
  }
}

PageTitleController.$inject = [
  'currentUserService',
  'organisationService',
];

export default PageTitleController;

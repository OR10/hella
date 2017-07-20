class OrganisationListController {
  /**
   * @param {$state} $state
   * @param {OrganisationGateway} organisationsGateway
   */
  constructor($state, organisationsGateway) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {OrganisationGateway}
     * @private
     */
    this._organisationGateway = organisationsGateway;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    this.organisations = [];

    this._loadOrganisations();
  }

  _loadOrganisations() {
    this.loadingInProgress = true;
    this._organisationGateway.getOrganisations().then(organisations => {
      this.organisations = organisations;
      this.loadingInProgress = false;
    });
  }

  /**
   * Open selected organisation in edit tap
   * @param {String} id
   */
  editOrganisation(id) {
    if (this.userPermissions.canEditOrganisation !== true) {
      return;
    }
    this._$state.go('labeling.organisation-management.detail', {organisationId: id});
  }
}

OrganisationListController.$inject = [
  '$state',
  'organisationGateway',
];

export default OrganisationListController;

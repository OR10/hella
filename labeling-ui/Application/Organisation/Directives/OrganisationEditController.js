class OrganisationEditController {
  /**
   * @param {$state} $state
   * @param {OrganisationGateway} organisationsGateway
   * @param {ModalService} modalService
   */
  constructor($state, organisationsGateway, modalService) {
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
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {boolean}
     */
    this.createMode = (this.id === 'new' || this.id === undefined);

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    this.userInput = '';
    this.unit = 'mb';
    this.quota = null;
    this.userQuota = null;
    this.maxLength = 140;

    this._loadOrganisations();
  }

  _loadOrganisations() {
    this.loadingInProgress = true;
    this._organisationGateway.getOrganisations().then(organisations => {
      this.organisations = organisations;
      if (!this.createMode) {
        this.selectedOrganisation = this.organisations.find(org => org.id === this.id);
        this.userInput = this.selectedOrganisation.name;
        this.userQuota = this.selectedOrganisation.userQuota;
        this.quota = this.selectedOrganisation.quota / Math.pow(1024, 2);
      }

      this.loadingInProgress = false;
    });
  }

  /**
   * Update the organisation name and persist organisation in the backend
   */
  saveChanges() {
    if (this.userPermissions.canCreateOrganisation !== true || this.userPermissions.canEditOrganisation !== true) {
      return
    }

    this.loadingInProgress = true;

    if (this.createMode) {
      this._createNewOrganisation();
    } else {
      this.selectedOrganisation.name = this.userInput;
      this.selectedOrganisation.quota = this._calculateBytes(this.quota, this.unit);
      this.selectedOrganisation.userQuota = this.userQuota;

      this._organisationGateway.updateOrganisation(this.selectedOrganisation)
          .then(() => this._goToOrganisationList());
    }
  }

  /**
   * Cancel the current editing process
   */
  cancelEdit() {
    this._modalService.info(
      {
        title: 'Cancel Organisation Editing',
        headline: `You are about to leave the current edit page. Proceed?`,
        message: 'All changes made to the organisation information will be lost. Continue?',
        confirmButtonText: 'Leave',
      },
      () => this._goToOrganisationList());
  }

  /**
   * Create a new organisation
   * @private
   */
  _createNewOrganisation() {
    this.loadingInProgress = true;
    const quota = this._calculateBytes(this.quota, this.unit);

    this._organisationGateway.createOrganisation(this.userInput, quota, this.userQuota)
        .then(() => this._goToOrganisationList());
  }

  /**
   * Go back to organisation overview
   * @private
   */
  _goToOrganisationList() {
    this.loadingInProgress = false;
    this._$state.go('labeling.organisation-management.list');
  }

  /**
   * Delete the current organisation
   */
  deleteOrganisation() { // eslint-disable-line
    throw new Error('Not implemented yet');
  }

  /**
   * Returns the quota in bytes given quota and unit.
   *
   * @param {number} quota
   * @param {string} unit
   * @return {number}
   * @private
   */
  _calculateBytes(quota, unit) {
    switch (unit) {
      case 'mb':
        return quota * Math.pow(1024, 2);
      case 'gb':
        return quota * Math.pow(1024, 3);
      case 'tb':
        return quota * Math.pow(1024, 4);
      default:
        throw new Error(`Unknown unit "${unit}"`);
    }
  }
}

OrganisationEditController.$inject = [
  '$state',
  'organisationGateway',
  'modalService',
];

export default OrganisationEditController;

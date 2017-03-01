class OrganisationListController {
  /**
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationGateway} organisationsGateway
   * @param {ModalService} modalService
   * @param {InputDialog} OrganisationDialog
   */
  constructor(currentUserService, organisationsGateway, modalService, OrganisationDialog) {
    /**
     * @type {User}
     */
    this.user = currentUserService.get();

    /**
     * @type {Object}
     */
    this.userPermissions = currentUserService.getPermissions();

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
     * @type {InputDialog}
     * @private
     */
    this._OrganisationDialog = OrganisationDialog;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

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
   * Update the organisation name and persist organisation in the backend
   *
   * @param {Organisation} organisation
   */
  updateOrganisation(organisation) {
    if (this.userPermissions.canEditOrganisation !== true) {
      return;
    }

    this._modalService.show(
      new this._OrganisationDialog(
        {
          title: 'Edit organisation.',
          headline: `Please enter a new name for the organisation with the current name "${organisation.name}"`,
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          userInput: organisation.name,
          quota: organisation.quota / (1024 * 2),
          unit: 'mb',
        },
        input => {
          this.loadingInProgress = true;
          organisation.name = input.name;
          organisation.quota = this._calculateBytes(input.quota, input.unit);

          this._organisationGateway.updateOrganisation(organisation)
            .then(() => this._loadOrganisations());
        }
      )
    );
  }

  createNewOrganisation() {
    this._modalService.show(
      new this._OrganisationDialog(
        {
          title: 'Create new organisation.',
          headline: 'Enter a name for the new organisation:',
          confirmButtonText: 'Create',
          cancelButtonText: 'Cancel',
        },
        input => {
          this.loadingInProgress = true;
          const quota = this._calculateBytes(input.quota, input.unit);

          this._organisationGateway.createOrganisation(input.name, quota)
            .then(() => this._loadOrganisations());
        }
      )
    );
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

OrganisationListController.$inject = [
  'currentUserService',
  'organisationGateway',
  'modalService',
  'OrganisationDialog',
];

export default OrganisationListController;

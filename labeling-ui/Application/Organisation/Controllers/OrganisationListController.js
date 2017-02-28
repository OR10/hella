class OrganisationListController {
  /**
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationGateway} organisationsGateway
   * @param {ModalService} modalService
   * @param {InputDialog} InputDialog
   */
  constructor(currentUserService, organisationsGateway, modalService, InputDialog) {
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
    this._InputDialog = InputDialog;

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
    this._modalService.show(
      new this._InputDialog(
        {
          title: 'Edit organisation.',
          headline: `Please enter a new name for the organisation with the current name "${organisation.name}"`,
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          userInput: organisation.name,
        },
        input => {
          this.loadingInProgress = true;
          organisation.name = input;

          this._organisationGateway.updateOrganisation(organisation)
            .then(() => this._loadOrganisations());
        }
      )
    );
  }

  createNewOrganisation() {
    this._modalService.show(
      new this._InputDialog(
        {
          title: 'Create new organisation.',
          headline: 'Enter a name for the new organisation:',
          confirmButtonText: 'Create',
          cancelButtonText: 'Cancel',
        },
        input => {
          this.loadingInProgress = true;

          // @Todo: read an use quota
          this._organisationGateway.createOrganisation(input, 0)
            .then(() => this._loadOrganisations());
        }
      )
    );
  }
}

OrganisationListController.$inject = [
  'currentUserService',
  'organisationGateway',
  'modalService',
  'InputDialog',
];

export default OrganisationListController;

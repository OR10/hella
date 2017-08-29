/**
 * Controller of the {@link UsersListDirective}
 */
class UsersListController {
  /**
   * @param {UserGateway} userGateway injected
   * @param {OrganisationGateway} organisationGateway
   * @param {OrganisationService} organisationService
   * @param {ModalService} modalService
   */
  constructor($state, userGateway, organisationGateway, organisationService, modalService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;

    /**
     * @type {OrganisationGateway}
     * @private
     */
    this._organisationGateway = organisationGateway;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {Array.<User>}
     */
    this.users = [];

    this._loadUsersList();
  }

  /**
   * Retrieve a fresh list of {@link User} objects from the backend.
   *
   * @private
   */
  _loadUsersList() {
    this.loadingInProgress = true;
    this._userGateway.getUsers()
      .then(users => {
        this.users = users;
        this.loadingInProgress = false;
      });
  }

  /**
   * Delete a certain User
   *
   * @param {User} user
   */
  deleteUser(user) {
    this._modalService.info(
      {
        title: 'Delete user',
        headline: `You are about to delete ${user.username}. Proceed?`,
        message: 'Removal of users from the database can not be reverted. Once the user is deleted it can not be restored. Only a new user may be created.',
        confirmButtonText: 'Delete',
      },
      () => {
        this.loadingInProgress = true;
        this._userGateway.deleteUser(user.id)
          .then(() => this._loadUsersList());
      },
      undefined,
      {
        warning: true,
      }
    );
  }

  removeUserFromOrganisation(user) {
    const organisation = this._organisationService.getModel();

    this._modalService.info(
      {
        title: 'Remove user from Organisation',
        headline: `You are about to remove ${user.username} from organisation ${organisation.name}. Proceed?`,
        confirmButtonText: 'Remove',
      },
      () => {
        this.loadingInProgress = true;
        this._organisationGateway.removeUserFromOrganisation(user, organisation)
          .then(() => this._loadUsersList());
      },
      undefined,
      {
        warning: true,
      }
    );
  }

  goToUserProfilePageIfAllowed(user) {
    if (this.userPermissions.canEditUser) {
      this._$state.go('labeling.users.detail', {userId: user.id});
    }
  }
}

UsersListController.$inject = [
  '$state',
  'userGateway',
  'organisationGateway',
  'organisationService',
  'modalService',
];

export default UsersListController;

/**
 * Controller of the {@link UsersListDirective}
 */
class UsersListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {UserGateway} userGateway injected
   * @param {SingleRoleFilter} singleRoleFilter
   * @param {ModalService} modalService
   */
  constructor($scope, userGateway, singleRoleFilter, modalService) {
    /**
     * List of tasks rendered by the directive
     * @type {null|Array.<Task>}
     */
    this.tasks = null;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;


    /**
     * @type {SingleRoleFilter}
     * @private
     */
    this._singleRoleFilter = singleRoleFilter;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {Array.<User>}
     */
    this.users = [];

    /**
     * This copy is needed and managed by smart-table for sorting filtering and displaying table data.
     *
     * @type {Array.<User>}
     */
    this.displayedUsers = [];

    this._loadUsersList();
  }


  /**
   * @param {User} user
   * @returns {string}
   */
  getSingleRoleForUser(user) {
    return this._singleRoleFilter(user.roles);
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
    const modal = this._modalService.getWarningDialog({
      title: 'Delete user',
      headline: `You are about to delete ${user.username}. Proceed?`,
      message: 'Removal of users from the database can not be reverted. Once the user is deleted it can not be restored. Only a new user may be created.',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }, () => {
      this.loadingInProgress = true;
      this._userGateway.deleteUser(user.id)
        .then(() => this._loadUsersList());
    });
    modal.activate();
  }
}

UsersListController.$inject = [
  '$scope',
  'userGateway',
  'singleRoleFilter',
  'modalService',
];

export default UsersListController;

import User from '../Models/User';

/**
 * Controller of the {@link UserProfileDirective}
 */
class UserProfileController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {UserGateway} userGateway injected
   * @param {SingleRoleFilter} singleRoleFilter
   * @param {ModalService} modalService
   * @param {$state} $state
   */
  constructor($scope, userGateway, singleRoleFilter, modalService, $state) {
    if (this.readonly === undefined) {
      this.readonly = true;
    }

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
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {User}
     */
    this.user = null;

    /**
     * @type {string}
     */
    this.singleRole = null;

    /**
     * @type {string|null}
     */
    this.newPassword = null;

    /**
     * @type {boolean}
     */
    this.createMode = (this.id === 'new');

    /**
     * @type {{username: boolean, email: boolean, password: boolean, role: boolean}}
     */
    this.validation = {
      username: true,
      email: true,
      password: true,
      role: true,
    };

    /**
     * @type {string|null}
     */
    this.newPasswordValidation = null;

    if (this.createMode) {
      this._createUser();
    } else {
      this._loadUser();
    }

    $scope.$watch('vm.user', user => {
      if (user === null) {
        this.singleRole = null;
        return;
      }

      this.singleRole = this._singleRoleFilter(user.roles);
    });
  }

  /**
   * @param {User} user
   * @returns {string}
   */
  getSingleRoleForUser(user) {
    return this._singleRoleFilter(user.roles);
  }

  _createUser() {
    this.user = new User({
      username: '',
      email: '',
      enabled: true,
      lastLogin: null,
      locked: false,
      roles: ['ROLE_LABELER'],
    });
  }

  /**
   * Retrieve a user by its id
   *
   * @private
   */
  _loadUser() {
    this.loadingInProgress = true;
    this._userGateway.getUser(this.id)
      .then(user => {
        this.user = user;
        this.loadingInProgress = false;
      });
  }

  /**
   * Cancel the current editing process
   */
  cancelEdit() {
    const modal = this._modalService.getInfoDialog({
      title: 'Cancel User Editing',
      headline: `You are about to leave the current edit page. Proceed?`,
      message: 'All changes made to the user information will be lost. Continue?',
      confirmButtonText: 'Leave',
      cancelButtonText: 'Cancel',
    }, () => this._$state.go('labeling.users.list'));

    modal.activate();
  }

  saveChanges() {
    if (!this._validateUser()) {
      return;
    }
    if (!this._updatePassword()) {
      return;
    }
    this._updateRoles();

    this.loadingInProgress = true;
    if (this.createMode) {
      this._userGateway.createUser(this.user).then(user => {
        this.user = user;
        this.loadingInProgress = false;
        this._$state.go('labeling.users.list');
      });
    } else {
      this._userGateway.updateUser(this.user).then(
        () => {
          this.loadingInProgress = false;
          this._$state.go('labeling.users.list');
        });
    }
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
        .then(() => this._$location.path('/users'));
    });
    modal.activate();
  }

  _updateRoles() {
    switch (this.singleRole) {
      case 'ROLE_ADMIN':
        this.user.roles = ['ROLE_ADMIN', 'ROLE_LABEL_COORDINATOR', 'ROLE_LABELER'];
        break;
      case 'ROLE_LABEL_COORDINATOR':
        this.user.roles = ['ROLE_LABEL_COORDINATOR', 'ROLE_LABELER'];
        break;
      case 'ROLE_LABELER':
        this.user.roles = ['ROLE_LABELER'];
        break;
      case 'ROLE_CLIENT':
        this.user.roles = ['ROLE_CLIENT'];
        break;
      default:
        throw new Error(`Unknown role: ${this.singleRole}`);
    }
  }

  _updatePassword() {
    if (this.newPassword === null || this.newPassword === '') {
      if (this.user.password) {
        delete this.user.password;
      }

      this.newPassword = null;
      this.newPasswordValidation = null;

      return true;
    }

    this.user.password = this.newPassword;


    this.newPassword = null;
    this.newPasswordValidation = null;

    return true;
  }

  /**
   * Validates the user
   *
   * @TODO: Change to user ngModel validation in the future
   *
   * @private
   */
  _validateUser() {
    let valid = true;

    this.validation.username = true;
    this.validation.email = true;
    this.validation.role = true;
    this.validation.password = true;

    if (this.user.username.length < 3) {
      this.validation.username = valid = false;
    }

    if (this.user.email.length < 3) {
      this.validation.email = valid = false;
    }

    if (['ROLE_ADMIN', 'ROLE_LABEL_COORDINATOR', 'ROLE_LABELER', 'ROLE_CLIENT'].indexOf(this.singleRole) === -1) {
      this.validation.role = valid = false;
    }

    if (this.newPassword !== this.newPasswordValidation) {
      this.validation.password = valid = false;
    }

    if (this.user.id === undefined && (this.newPassword === null || this.newPassword === '')) {
      this.validation.password = valid = false;
    }

    return valid;
  }
}

UserProfileController.$inject = [
  '$scope',
  'userGateway',
  'singleRoleFilter',
  'modalService',
  '$state',
];

export default UserProfileController;

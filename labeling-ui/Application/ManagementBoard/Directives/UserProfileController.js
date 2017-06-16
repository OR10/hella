import User from '../Models/User';

/**
 * Controller of the {@link UserProfileDirective}
 */
class UserProfileController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$q} $q
   * @param {$state} $state
   * @param {UserGateway} userGateway injected
   * @param {OrganisationGateway} organisationGateway
   * @param {OrganisationService} organisationService
   * @param {SingleRoleFilter} singleRoleFilter
   * @param {ModalService} modalService
   * @param {CurrentUserService} currentUserService
   */
  constructor($scope, $q, $state, userGateway, organisationGateway, organisationService, singleRoleFilter, modalService, currentUserService) {
    if (this.readonly === undefined) {
      this.readonly = true;
    }

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

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
     * @type {OrganisationGateway}
     * @private
     */
    this._organisationGateway = organisationGateway;

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
     * @type {Array}
     */
    this.organisations = [];

    /**
     * @type {Array}
     */
    this.userOrganisations = [];

    /**
     * @type {null}
     */
    this.organisationToAdd = null;

    /**
     * @type {boolean}
     */
    this.createMode = (this.id === 'new');

    /**
     * @type {CurrentUserService}
     */
    this.currentUserService = currentUserService;

    /**
     *
     * @type {Array}
     */
    this.availableRoles = [
      {id: 'ROLE_LABELER', label: 'Labeler'},
      {id: 'ROLE_LABEL_COORDINATOR', label: 'Label Coordinator'},
      {id: 'ROLE_CLIENT_COORDINATOR', label: 'Client + Label Coordinator'},
      {id: 'ROLE_CLIENT', label: 'Client'},
      {id: 'ROLE_ADMIN', label: 'Administrator'},
      {id: 'ROLE_OBSERVER', label: 'Observer'},
    ];

    // If creator can not add organisations by hand, add new user to creators organisation
    if (!this.userPermissions.canAddUserToAnyOrganisation) {
      this.userOrganisations.push(organisationService.getModel());
    }

    // If the currently looged in user is a super admin, he is allowed to see the super admin role
    if (this.currentUserService.isSuperAdmin()) {
      this.availableRoles.push({id: 'ROLE_SUPER_ADMIN', label: 'SuperAdmin'});
    }

    /**
     * @type {{username: boolean, email: boolean, password: boolean, role: boolean, organisations: boolean}}
     */
    this.validation = {
      username: true,
      email: true,
      password: true,
      role: true,
      organisations: true,
    };

    /**
     * @type {string|null}
     */
    this.newPasswordValidation = null;

    if (this.createMode) {
      this._createUser();
    } else {
      this._loadData();
    }

    $scope.$watch('vm.user', user => {
      if (user === null) {
        this.singleRole = null;
        return;
      }

      const singleRole = this._singleRoleFilter(user.roles);
      this.singleRole = this.availableRoles.filter(
        role => role.id === singleRole
      )[0];
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
    this.loadingInProgress = true;

    this._organisationGateway.getOrganisations().then(organisations => {
      this.organisations = organisations;
      this.organisationToAdd = this.organisations[0];
      this.loadingInProgress = false;
    });

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
  _loadData() {
    this.loadingInProgress = true;
    const userPromise = this._userGateway.getUser(this.id);
    const organisationPromise = this._organisationGateway.getOrganisations();

    this._$q.all([userPromise, organisationPromise])
      .then(([user, organisations]) => {
        this.user = user;
        this.organisations = organisations;
        this.organisationToAdd = this.organisations[0];
        this.userOrganisations = user.organisations;

        this.loadingInProgress = false;
      });
  }

  /**
   * Cancel the current editing process
   */
  cancelEdit() {
    this._modalService.info(
      {
        title: 'Cancel User Editing',
        headline: `You are about to leave the current edit page. Proceed?`,
        message: 'All changes made to the user information will be lost. Continue?',
        confirmButtonText: 'Leave',
      },
      () => this._$state.go('labeling.users.list')
    );
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
      this._userGateway.createUser(this.user)
        .then(user => {
          this.user = user;

          return this._assignUserToOrganisations(user);
        })
        .then(() => {
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
          .then(() => this._$state.go('labeling.users.list'));
      },
      undefined,
      {
        warning: true,
      }
    );
  }

  addUserToOrganisation(organisation) {
    if (this.createMode) {
      this.userOrganisations.push(organisation);
      return;
    }

    this.loadingInProgress = true;
    this._organisationGateway.addUserToOrganisation(this.user, organisation)
      .then(() => {
        this._loadData();
      });
  }

  removeUserFromOrganisation(organisation) {
    if (this.createMode) {
      this.userOrganisations.splice(this.userOrganisations.indexOf(organisation), 1);
      return;
    }

    this.loadingInProgress = true;
    this._organisationGateway.removeUserFromOrganisation(this.user, organisation)
      .then(() => {
        this._loadData();
      });
  }

  _assignUserToOrganisations(user) {
    const promises = [];

    this.userOrganisations.forEach(organisation => {
      const promise = this._organisationGateway.addUserToOrganisation(user, organisation);
      promises.push(promise);
    });

    return this._$q.all(promises);
  }

  _updateRoles() {
    switch (this.singleRole.id) {
      case 'ROLE_ADMIN':
        this.user.roles = ['ROLE_ADMIN', 'ROLE_LABEL_COORDINATOR', 'ROLE_LABELER'];
        break;
      case 'ROLE_SUPER_ADMIN':
        this.user.roles = ['ROLE_SUPER_ADMIN'];
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
      case 'ROLE_CLIENT_COORDINATOR':
        this.user.roles = ['ROLE_CLIENT', 'ROLE_LABEL_COORDINATOR'];
        break;
      case 'ROLE_OBSERVER':
        this.user.roles = ['ROLE_OBSERVER'];
        break;
      default:
        throw new Error(`Unknown role: ${this.singleRole.id}`);
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
   * Get the IDs from all the available roles
   *
   * @returns {Array}
   * @private
   */
  _getAllRoleIds() {
    return this.availableRoles.reduce((roles, currentRole) => {
      roles.push(currentRole.id);
      return roles;
    }, []);
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
    this.validation.organisations = true;

    if (this.user.username.length < 3) {
      this.validation.username = valid = false;
    }

    if (this.user.email.length < 3) {
      this.validation.email = valid = false;
    }

    if (this._getAllRoleIds().indexOf(this.singleRole.id) === -1) {
      this.validation.role = valid = false;
    }

    if (this.newPassword !== this.newPasswordValidation) {
      this.validation.password = valid = false;
    }

    if (this.user.id === undefined && (this.newPassword === null || this.newPassword === '')) {
      this.validation.password = valid = false;
    }

    if (this.userPermissions.canAddUserToAnyOrganisation && this.userOrganisations.length === 0) {
      this.validation.organisations = valid = false;
    }

    return valid;
  }
}

UserProfileController.$inject = [
  '$scope',
  '$q',
  '$state',
  'userGateway',
  'organisationGateway',
  'organisationService',
  'singleRoleFilter',
  'modalService',
  'currentUserService',
];

export default UserProfileController;

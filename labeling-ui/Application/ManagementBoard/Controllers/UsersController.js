/**
 * Route Controller for a list of users
 */
class UsersController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   */
  constructor($scope, $state, $stateParams, user, userPermissions) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {User}
     * @private
     */
    this.user = user;

    /**
     * @type {Object}
     * @private
     */
    this.userPermissions = userPermissions;

    switch ($stateParams.userId) {
      case undefined:
        this.activeTab = UsersController.MANAGE_TAB_INDEX;
        break;
      case 'new':
        this.activeTab = UsersController.NEW_TAB_INDEX;
        break;
      default:
        this.activeTab = UsersController.EDIT_TAB_INDEX;
        this.userId = $stateParams.userId;
    }

    /**
     * @type {boolean}
     */
    this.showEditTab = !(this.userId === 'new' || this.userId === undefined);

    /**
    * @type {boolean}
    */
    this.showNewTab = this.userPermissions.canAddUser;

    this._$scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case UsersController.NEW_TAB_INDEX:
          this._$state.go('labeling.users.detail', {userId: 'new'});
          break;
        default:
          this._$state.go('labeling.users.list');
      }
    });
  }
}

UsersController.NEW_TAB_INDEX = 0;
UsersController.MANAGE_TAB_INDEX = 1;
UsersController.EDIT_TAB_INDEX = 2;

UsersController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersController;

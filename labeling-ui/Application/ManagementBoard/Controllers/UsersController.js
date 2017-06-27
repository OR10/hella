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
        this.activeTab = 'manage';
        break;
      case 'new':
        this.activeTab = 'new';
        break;
      default:
        this.activeTab = 'edit';
        this.userId = $stateParams.userId;
    }

    /**
     * @type {boolean}
     */
    this.showEditTap = !(this.userId === 'new' || this.userId === undefined);

    this._$scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case 'new':
          this._$state.go('labeling.users.detail', {userId: 'new'});
          break;
        default:
          this._$state.go('labeling.users.list');
      }
    });
  }
}

UsersController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersController;

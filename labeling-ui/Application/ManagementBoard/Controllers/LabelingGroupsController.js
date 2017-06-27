/**
 * Route Controller for a list of labeling groups
 */
class LabelingGroupsController {
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
     * @type {$stateParams}
     * @private
     */
    this._$state = $state;

    /**
     * @type {$stateParams}
     * @private
     */
    this._$stateParams = $stateParams;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    switch ($stateParams.groupId) {
      case undefined:
        this.activeTab = 'manage';
        break;
      case 'new':
        this.activeTab = 'new';
        break;
      default:
        this.activeTab = 'edit';
        this.groupId = $stateParams.groupId;
    }

    /**
     * @type {boolean}
     */
    this.showEditTap = !(this.groupId === 'new' || this.groupId === undefined);

    this._$scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case 'new':
          this._$state.go('labeling.labeling-groups.detail', {groupId: 'new'});
          break;
        default:
          this._$state.go('labeling.labeling-groups.list');
      }
    });
  }
}

LabelingGroupsController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'user',
  'userPermissions',
];

export default LabelingGroupsController;

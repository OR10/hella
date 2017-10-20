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
        this.activeTab = LabelingGroupsController.MANAGE_TAB_INDEX;
        break;
      case 'new':
        this.activeTab = LabelingGroupsController.NEW_TAB_INDEX;
        break;
      default:
        this.activeTab = LabelingGroupsController.EDIT_TAB_INDEX;
        this.groupId = $stateParams.groupId;
    }

    /**
     * @type {boolean}
     */
    this.showEditTab = !(this.groupId === 'new' || this.groupId === undefined);

    this._$scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case LabelingGroupsController.NEW_TAB_INDEX:
          this._$state.go('labeling.labeling-groups.detail', {groupId: 'new'});
          break;
        default:
          this._$state.go('labeling.labeling-groups.list');
      }
    });
  }
}

LabelingGroupsController.NEW_TAB_INDEX = 0;
LabelingGroupsController.MANAGE_TAB_INDEX = 1;
LabelingGroupsController.EDIT_TAB_INDEX = 2;

LabelingGroupsController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'user',
  'userPermissions',
];

export default LabelingGroupsController;

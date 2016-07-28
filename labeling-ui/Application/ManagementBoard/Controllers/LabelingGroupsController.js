/**
 * Route Controller for a list of labeling groups
 */
class LabelingGroupsController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   */
  constructor($scope, $stateParams, user, userPermissions) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;
  }
}

LabelingGroupsController.$inject = [
  '$scope',
  '$stateParams',
  'user',
  'userPermissions',
];

export default LabelingGroupsController;

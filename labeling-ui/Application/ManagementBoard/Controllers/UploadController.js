class UploadController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Object} project
   */
  constructor($rootScope, $scope, $state, user, userPermissions, project) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

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
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.project = project;

    /**
     * @type {UserPermissions}
     */
    this.userPermissions = userPermissions;
  }
}

UploadController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  'user',
  'userPermissions',
  'project',
];

export default UploadController;

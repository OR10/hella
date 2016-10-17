/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectFlaggedController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Project} project
   */
  constructor($scope, $stateParams, user, userPermissions, project) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$stateParams}
     */
    this._$stateParams = $stateParams;

    /**
     * @type {string}
     */
    this.projectId = this._$stateParams.projectId;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {Project}
     */
    this.project = project;
  }
}

ProjectFlaggedController.$inject = [
  '$scope',
  '$stateParams',
  'user',
  'userPermissions',
  'project',
];

export default ProjectFlaggedController;

/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectsController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {User} user
   * @param {Object} userPermissions
   * @param {ProjectGateway} projectGateway
   */
  constructor($scope, user, userPermissions, projectGateway) {
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

    /**
     *
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * @type {Object|null}
     */
    this.projectCount = null;

    // Initial load of counts
    this._loadProjectCount();

    // Load count of projects in different states to display
    this._$scope.$on('project-list:dependant-projects-changed', () => {
      this._$scope.$broadcast('project-list:reload-requested');
      this._loadProjectCount();
    });
  }

  _loadProjectCount() {
    this._projectGateway.getProjectCount()
      .then(projectCount => this.projectCount = Object.assign({}, {todo: 0, in_progress: 0, done: 0}, projectCount));
  }
}

ProjectsController.$inject = [
  '$scope',
  'user',
  'userPermissions',
  'projectGateway',
];

export default ProjectsController;

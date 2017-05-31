/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectsController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   * @param {OrganisationService} organisationService
   * @param {ProjectGateway} projectGateway
   */
  constructor($scope, $stateParams, user, userPermissions, organisationService, projectGateway) {
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

    /**
     * @type {String|null}
     */
    this.campaignName = null;

    /**
     * @type {boolean}
     */
    this.showLoadingMask = false;

    // Initial load of counts
    this._loadProjectCount();

    // Load count of projects in different states to display
    this._$scope.$on('project-list:dependant-projects-changed', () => {
      this._$scope.$broadcast('project-list:reload-requested');
      this._loadProjectCount();
    });

    this._getCampaignName();
  }

  _loadProjectCount() {
    this._projectGateway.getProjectCount()
      .then(projectCount => this.projectCount = Object.assign({}, {todo: 0, in_progress: 0, done: 0}, projectCount));
  }
  _getCampaignName() {
    this.campaignName = 'Campaignname';
  }
}

ProjectsController.$inject = [
  '$scope',
  '$stateParams',
  'user',
  'userPermissions',
  'organisationService',
  'projectGateway',
];

export default ProjectsController;

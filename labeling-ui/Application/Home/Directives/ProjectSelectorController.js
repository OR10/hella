/**
 * Controller of the {@link ProjectSelectorDirective}
 */
class ProjectSelectorController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {Object} $stateParams
   * @param {Object} $state
   * @param {ProjectGateway} projectGateway
   */
  constructor($scope, projectGateway) {
    /**
     * List of projects rendered by the directive
     * @type {Array.<Project>}
     */
    this.projects = [];

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * Currently active project project
     *
     * @type {string|undefined}
     */
    this.selectedProject = '';

    /**
     * @type {NgModelController| null}
     * @private
     */
    this._ngModelController = null;

    $scope.$watch('vm.selectedProject', newValue => {
      if (this._ngModelController !== null) {
        this._ngModelController.$setViewValue(newValue);
      }
    });

    this._loadProjects();
  }

  /**
   * @param ngModelController
   */
  setNgModelController(ngModelController) {
    this._ngModelController = ngModelController;
    this._ngModelController.$render = () => this.selectedProject = this._ngModelController.$viewValue;
    this._ngModelController.$render();
  }

  /**
   * Load a list of {@link Project}s for the project filters.
   *
   * @private
   */
  _loadProjects() {
    this.loadingInProgress = true;
    this._projectGateway.getProjects().then(projects => {
      this.projects = projects;
      this.loadingInProgress = false;
    });
  }
}

ProjectSelectorController.$inject = [
  '$scope',
  'projectGateway',
];

export default ProjectSelectorController;

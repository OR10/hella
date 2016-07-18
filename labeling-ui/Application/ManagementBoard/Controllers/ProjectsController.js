import ClickableRowTemplate from '../Views/Grid/ClickableRow.html!';
import Environment from '../../Common/Support/Environment';

/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectsController {
  /**
   * @param {$scope} $scope
   * @param {$state} $state
   * @param {projectGateway} projectGateway
   * @param {User} user
   * @param {UserPermissions} userPermissions
   */
  constructor($scope, $state, projectGateway, user, userPermissions) {
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
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {UserPermissions}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {Array}
     * @private
     */
    this._projects = [];

    /**
     * @type {boolean}
     */
    this.loadingInProgress = true;

    this._$scope.projectGridOptions = {
      enableColumnMenus: false,
      enableSorting: false,
      gridMenuShowHideColumns: false,
      rowTemplate: ClickableRowTemplate,
      columnDefs: [
        {field: 'id', visible: false},
        {displayName: 'Status', field: 'status', width: '*', enableSorting: false},
        {displayName: 'Name', field: 'name', width: '*', enableSorting: false},
        {displayName: '% finished', field: 'percentage', width: '*', enableSorting: false},
        // {
        //   name: 'actions',
        //   width: 200,
        //   enablePinning: true,
        //   pinnedRight: true,
        //   cellTemplate: ActionCellTemplate,
        // },
      ],
      data: this._projects,
    };

    this._loadProjectList();
  }

  goToProject(id) {
    this._$state.go('labeling.tasks.list', {projectId: id});
  }

  _loadProjectList() {
    this._projectGateway.getProjects().then(projects => {
      this.projects = projects;

      this._$scope.projectGridOptions.data = projects.map(project => {
        project.percentage = Math.round((project.taskFinishedCount / project.taskCount) * 100) + '%';
        // delete project.id;
        delete project.taskFinishedCount;
        delete project.taskCount;
        delete project.creation_timestamp;
        return project;
      });
      this.loadingInProgress = false;
    }).then(() => {
      /* *****************************************************************
       * START: Only executable in e2e tests
       * *****************************************************************/
      if (Environment.isTesting) {
        window.__TEST_READY_PROMISE_RESOLVE();
      }
      /* *****************************************************************
       * END: Only executable in e2e tests
       * *****************************************************************/
    });
  }
}

ProjectsController.$inject = [
  '$scope',
  '$state',
  'projectGateway',
  'user',
  'userPermissions',
];

export default ProjectsController;

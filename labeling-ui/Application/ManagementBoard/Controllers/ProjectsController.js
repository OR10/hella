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
     */
    this.projects = [];

    /**
     * @type {{pageNumber: number, pageSize: number}}
     */
    const paginationOptions = {
      pageNumber: 1,
      pageSize: 5,
    };

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    this.projectGridOptions = {
      paginationPageSize: 5,
      paginationPageSizes: [5, 10, 50],
      useExternalPagination: true,
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
      onRegisterApi: gridApi => {
        gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
          paginationOptions.pageNumber = newPage;
          paginationOptions.pageSize = pageSize;
          this._loadProjects(newPage, pageSize);
        });
      },
      data: this.projects,
    };

    this._loadProjects();
  }

  goToProject(id) {
    this._$state.go('labeling.tasks.list', {projectId: id});
  }

  _loadProjects(newPage = 1, pageSize = 5) {
    this.loadingInProgress = true;
    const limit = pageSize;
    const offset = (newPage - 1) * pageSize;

    this._projectGateway.getProjects(limit, offset).then(response => {
      this.projects = response.result;

      this.projectGridOptions.data = response.result.map(project => {
        project.percentage = Math.round((project.taskFinishedCount / project.taskCount) * 100) + '%';
        // delete project.id;
        delete project.taskFinishedCount;
        delete project.taskCount;
        delete project.creation_timestamp;
        return project;
      });

      this.projectGridOptions.data = this.projects;
      // TODO fix
      this.projectGridOptions.totalItems = response.totalRows;
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

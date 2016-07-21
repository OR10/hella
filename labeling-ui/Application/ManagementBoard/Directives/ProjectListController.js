import ClickableRowTemplate from '../Views/Grid/ClickableRow.html!';
import ProjectActionCellTemplate from '../Views/Grid/ProjectActionButtonCell.html!';
import DateCellTemplate from '../Views/Grid/DateCell.html!';
import Environment from '../../Common/Support/Environment';

/**
 * Controller of the {@link ProjectListDirective}
 */
class ProjectListController {
  /**
   * @param {$scope} $scope
   * @param {$state} $state
   * @param {ProjectGateway} projectGateway
   */
  constructor($scope, $state, projectGateway) {
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
      columnDefs: [],
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

  rowClick(rowEntity) {
    this._$state.go('labeling.tasks.list', {projectId: rowEntity.id});
  }

  _loadProjects(newPage = 1, pageSize = 5) {
    this.loadingInProgress = true;
    const limit = pageSize;
    const offset = (newPage - 1) * pageSize;

    this._projectGateway.getProjects(this.projectStatus, limit, offset)
      .then(response => {
        this._buildColumnDefs(response.result[0]);
        this._filterData(response.result);

        this.projectGridOptions.data = this.projects;
        this.projectGridOptions.totalItems = response.totalRows;
        this.loadingInProgress = false;
      });
  }

  _buildColumnDefs(project) {
    const defs = [
      {field: 'id', visible: false},
    ];

    if (!project) {
      return;
    }

    if (project.hasOwnProperty('status')) {
      defs.push({displayName: 'Status', field: 'status', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('name')) {
      defs.push({displayName: 'Name', field: 'name', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('videoCount')) {
      defs.push({displayName: 'Video Count', field: 'videoCount', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('taskCount')) {
      defs.push({displayName: 'Task count', field: 'taskCount', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('taskInProgressCount')) {
      defs.push({
        displayName: 'Task in progress count',
        field: 'taskInProgressCount',
        width: '*',
        enableSorting: false,
      });
    }

    if (project.hasOwnProperty('taskFinishedCount')) {
      defs.push({displayName: 'Task done count', field: 'taskFinishedCount', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('taskFinishedCount') && project.hasOwnProperty('taskCount')) {
      defs.push({displayName: '% finished', field: 'percentage', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('objectFrameCount')) {
      defs.push({displayName: 'Object frames', field: 'objectFrameCount', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('timeInProject')) {
      defs.push({displayName: 'Time spent in project', field: 'timeInProject', width: '*', enableSorting: false});
    }

    if (project.hasOwnProperty('creationTimestamp')) {
      defs.push({
        displayName: 'Start date',
        field: 'creationTimestamp',
        width: '*',
        enableSorting: false,
        cellTemplate: DateCellTemplate,
      });
    }

    if (project.hasOwnProperty('dueTimestamp')) {
      defs.push({
        displayName: 'Due date',
        field: 'dueTimestamp',
        width: '*',
        enableSorting: false,
        cellTemplate: DateCellTemplate,
      });
    }

    if (this._showActionColumn()) {
      defs.push({
        name: 'actions',
        width: 200,
        enablePinning: true,
        pinnedRight: true,
        cellTemplate: ProjectActionCellTemplate,
      });
    }

    this.projectGridOptions.columnDefs = defs;
  }

  _showActionColumn() {
    // TODO: fix
    return true;
  }

  _filterData(projects) {
    this.projects = projects.map(project => {
      project.percentage = Math.round((project.taskFinishedCount / project.taskCount) * 100) + '%';
      project.creationTimestamp = project.creationTimestamp * 1000;
      project.dueTimestamp = project.dueTimestamp ? project.dueTimestamp * 1000 : '';
      return project;
    });

    this.projectGridOptions.data = this.projects;
  }
}

ProjectListController.$inject = [
  '$scope',
  '$state',
  'projectGateway',
];

export default ProjectListController;

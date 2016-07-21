import ClickableRowTemplate from '../Views/Grid/ClickableRow.html!';
import ActionCellTemplate from '../Views/Grid/ActionButtonCell.html!';

/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {TaskGateway} taskGateway injected
   */
  constructor($scope, $state, taskGateway) {
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
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {number}
     */
    this.taskCount = 0;

    /**
     * @type {Array}
     */
    this.tasks = [];

    /**
     * @type {{pageNumber: number, pageSize: number}}
     */
    const paginationOptions = {
      pageNumber: 1,
      pageSize: 5,
    };

    /**
     * @type {Object}
     */
    this.gridOptions = {
      paginationPageSize: 5,
      paginationPageSizes: [5, 10, 50],
      useExternalPagination: true,
      enableColumnMenus: false,
      enableSorting: false,
      gridMenuShowHideColumns: false,
      rowTemplate: ClickableRowTemplate,
      columnDefs: [
        {displayName: 'Type', field: 'type', width: '150', enableSorting: false},
        {displayName: 'Title', field: 'title', width: '*', enableSorting: false},
        {displayName: 'Range', field: 'range', width: '100', enableSorting: false},
        {displayName: 'Assignee', field: 'assignee.username', width: '200', enableSorting: false},
        {
          name: 'actions',
          width: 200,
          enablePinning: true,
          pinnedRight: true,
          cellTemplate: ActionCellTemplate,
        },
      ],
      onRegisterApi: gridApi => {
        gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
          paginationOptions.pageNumber = newPage;
          paginationOptions.pageSize = pageSize;
          this._loadTasks(newPage, pageSize);
        });
      },
      data: this.tasks,
    };

    this._loadTasks();
  }

  rowClick(rowEntity) {
    this._$state.go('labeling.tasks.detail', {taskId: rowEntity.id});
  }

  _loadTasks(newPage = 1, pageSize = 5) {
    this.loadingInProgress = true;
    const limit = pageSize;
    const offset = (newPage - 1) * pageSize;

    this._taskGateway.getTasksForProject(this.projectId, this.taskStatus, limit, offset).then(response => {
      this.tasks = response.result.map(task => {
        return {
          id: task.id,
          type: task.taskType,
          title: task.video.name,
          range: `${task.metaData.frameRange.startFrameNumber} - ${task.metaData.frameRange.endFrameNumber}`,
          assignee: task.assignedUser,
        };
      });
      this.gridOptions.data = this.tasks;
      this.taskCount = response.totalRows;
      this.gridOptions.totalItems = response.totalRows;

      this.loadingInProgress = false;
    });
  }
}

TaskListController.$inject = [
  '$scope',
  '$state',
  'taskGateway',
];

export default TaskListController;

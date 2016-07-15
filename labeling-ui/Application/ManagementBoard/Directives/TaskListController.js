import ActionCellTemplate from '../Views/Grid/ActionButtonCell.html!';

/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {TaskGateway} taskGateway injected
   */
  constructor($scope, taskGateway) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

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
      // rowTemplate: ClickableRowTemplate,
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

  _loadTasks(newPage = 1, pageSize = 5) {
    this.loadingInProgress = true;
    const limit = pageSize;
    const offset = (newPage - 1) * pageSize;

    this._taskGateway.getTasksAndVideosForProject(this.projectId, this.taskStatus, limit, offset).then(({tasks, videos, users}) => {
      this.tasks = tasks[this.taskStatus].map(task => {
        let assignedUser = null;
        if (task.assignedUser !== null) {
          assignedUser = users.find(user => {
            return user.id === task.assignedUser;
          });
        }

        return {
          id: task.id,
          type: task.taskType,
          title: videos[task.videoId].name,
          range: `${task.metaData.frameRange.startFrameNumber} - ${task.metaData.frameRange.endFrameNumber}`,
          assignee: assignedUser,
        };
      });
      this.gridOptions.data = this.tasks;
      // TODO fix
      this.taskCount = this.tasks.length;
      this.gridOptions.totalItems = 6;

      this.loadingInProgress = false;
    });
  }
}

TaskListController.$inject = [
  '$scope',
  'taskGateway',
];

export default TaskListController;

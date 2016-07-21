import TaskActionCellTemplate from '../Views/Grid/TaskActionButtonCell.html!';
import ClickableCellTemplate from '../Views/Grid/ClickableCell.html!';

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
     * @private
     */
    this._paginationOptions = {
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
      columnDefs: [
        {
          displayName: 'Type',
          field: 'type',
          width: '150',
          enableSorting: false,
          cellTemplate: ClickableCellTemplate,
        },
        {
          displayName: 'Title',
          field: 'title',
          width: '*',
          enableSorting: false,
          cellTemplate: ClickableCellTemplate,
        },
        {
          displayName: 'Range',
          field: 'range',
          width: '100',
          enableSorting: false,
          cellTemplate: ClickableCellTemplate,
        },
        {
          displayName: 'Assignee',
          field: 'assignee',
          width: '200',
          enableSorting: false,
          cellTemplate: ClickableCellTemplate,
        },
        {
          name: 'actions',
          width: 200,
          enablePinning: true,
          pinnedRight: true,
          cellTemplate: TaskActionCellTemplate,
        },
      ],
      onRegisterApi: gridApi => {
        gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
          this._paginationOptions.pageNumber = newPage;
          this._paginationOptions.pageSize = pageSize;
          this._loadTasks();
        });
      },
      data: this.tasks,
    };

    this._loadTasks();
  }

  rowClick(rowEntity) {
    //TODO: assign user
    this._$state.go('labeling.tasks.detail', {taskId: rowEntity.id});
  }

  unassignTask(rowEntity) {
    this._taskGateway.dissociateUserFromTask(rowEntity.id, rowEntity.assigneeId).then(() => {
      this._loadTasks();
    });
  }

  _loadTasks() {
    this.loadingInProgress = true;
    const limit = this._paginationOptions.pageSize;
    const offset = (this._paginationOptions.pageNumber - 1) * limit;

    this._taskGateway.getTasksForProject(this.projectId, this.taskStatus, limit, offset).then(response => {
      this.tasks = response.result.map(task => {
        return {
          id: task.id,
          type: task.taskType,
          title: task.video.name,
          range: `${task.metaData.frameRange.startFrameNumber} - ${task.metaData.frameRange.endFrameNumber}`,
          assignee: task.assignedUser,
          assigneeId: task.assignedUserId,
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

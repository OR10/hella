/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {object} featureFlags
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   * @param {TaskGateway} taskGateway injected
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
   * @param {ReplicationStateService} replicationStateService
   */
  constructor(featureFlags, $scope, $state, $q, loggerService, taskGateway, modalService, SelectionDialog, replicationStateService) {
    /**
     * @type {Object}
     * @private
     */
    this._featureFlags = featureFlags;

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
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = loggerService;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {SelectionDialog}
     * @private
     */
    this._SelectionDialog = SelectionDialog;

    /**
     * @type {Object.<Task>}
     * @private
     */
    this._tasksById = {};

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {number}
     */
    this.totalRows = 0;

    /**
     * @type {Array}
     */
    this.tasks = [];

    /**
     * @type {number}
     * @private
     */
    this._currentPage = 1;

    /**
     * @type {number}
     * @private
     */
    this._currentItemsPerPage = 0;

    /**
     * @type {ReplicationStateService}
     * @private
     */
    this._replicationStateService = replicationStateService;

    // Reload upon request
    this._$scope.$on('task-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });
  }

  openTask(taskId) {
    const task = this._tasksById[taskId];

    if (task.labelDataImportInProgress) {
      this._modalService.info(
        {
          title: 'Labeled-Data import in progress',
          headline: 'We are still importing label-data please wait...',
          message: 'You can\'t access this task until all labels are processed',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
      return false;
    }

    // If this is the users task open it
    if (task.isUsersTask(this.user)) {
      return this._gotoTask(taskId, this.taskPhase);
    }

    // If it is not the users tasks check if assignment is possible
    if (
      !this.userPermissions.canBeginTask ||
      !task.isUserAllowedToBeAssigned(this.user)
    ) {
      this._modalService.info(
        {
          title: 'Task is read-only',
          headline: 'This task is already assigned to someone else or you are not allowed to edit this task.',
          message: 'You are only allowed to open it in read only mode',
          confirmButtonText: 'Open read only',
        }, () => this._gotoTask(taskId, this.taskPhase)
      );
    } else {
      this.loadingInProgress = true;
      this._taskGateway.assignAndMarkAsInProgress(taskId).then(
        () => this._gotoTask(taskId, this.taskPhase)
      );
    }
  }

  _gotoTask(taskId, phase) {
    if (this._featureFlags.pouchdb === true) {
      this._replicationStateService.setIsReplicating(true);
    }
    return this._$state.go('labeling.tasks.detail', {taskId, phase});
  }

  unassignTask(taskId, assigneeId) {
    this._taskGateway.unassignUserFromTask(taskId, assigneeId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  flagTask(taskId) {
    if (this._tasksById[taskId].taskAttentionFlag) {
      this._modalService.info(
        {
          title: 'Already Flagged',
          headline: 'This task is already flagged! Please wait for the labeling coordinator to remove the flag.',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          abortable: false,
        }
      );
      return;
    }
    this._taskGateway.flagTask(taskId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  moveTask(taskId) {
    const selectedTask = this.tasks.find(task => task.id === taskId);

    let selectionData = [
      {id: 'labeling', name: 'Labeling'},
      {id: 'review', name: 'Review'},
      {id: 'revision', name: 'Revision'},
      {id: 'all_phases_done', name: 'Done'},
    ].filter(selection => selection.id !== selectedTask.phase);

    if (!selectedTask.hasReview) {
      selectionData = selectionData.filter(selection => selection.id !== 'review');
    }

    this._modalService.show(
      new this._SelectionDialog(
        {
          title: 'Move task',
          headline: `Please select the phase that you want this task to be moved to:`,
          confirmButtonText: 'Move task',
          message: '',
          data: selectionData,
        },
        phase => {
          if (phase) {
            this.loadingInProgress = true;
            this._taskGateway.moveTaskToPhase(taskId, phase)
              .then(() => this._triggerReloadAll());
          } else {
            this._modalService.info(
              {
                title: 'No phase selected',
                headline: 'You need to select a phase',
                message: 'You need to select a phase to move this task to. Without a selected phase the task can not bei moved!',
                confirmButtonText: 'Understood',
              },
              undefined,
              undefined,
              {
                warning: true,
                abortable: false,
              }
            );
          }
        }
      )
    );
  }

  reopenTask(taskId, phase) {
    this._taskGateway.reopenTask(taskId, phase).then(() => this._triggerReloadAll());
  }

  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

    this._currentPage = page;
    this._currentItemsPerPage = itemsPerPage;

    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;

    this._taskGateway.getTasksForProjectWithPhaseAndStatus(this.projectId, this.taskPhase, this.taskStatus, limit, offset)
      .then(result => {
        this.totalRows = result.totalRows;

        result.tasks.forEach(task => {
          this._tasksById[task.id] = task;
        });

        this.tasks = result.tasks.map(task => {
          const assignedUser = task.getLatestAssignedUserForPhase(this.taskPhase);
          return {
            id: task.id,
            type: task.taskType,
            title: task.video.name,
            range: `${task.frameNumberMapping[0]} - ${task.frameNumberMapping[task.frameNumberMapping.length - 1]}`,
            latestAssignee: assignedUser,
            status: task.getStatusForPhase(this.taskPhase),
            phase: task.getPhase(),
            hasReview: task.status.review !== undefined,
            labelInstruction: task.labelInstruction,
            reopen: task.reopen,
            attentionFlag: task.taskAttentionFlag,
            labelDataImportInProgress: task.labelDataImportInProgress,
          };
        });

        this.loadingInProgress = false;
      });
  }

  _triggerReloadAll() {
    this._$scope.$emit('task-list:dependant-tasks-changed');
  }
}

TaskListController.$inject = [
  'featureFlags',
  '$scope',
  '$state',
  '$q',
  'loggerService',
  'taskGateway',
  'modalService',
  'SelectionDialog',
  'replicationStateService',
];

export default TaskListController;

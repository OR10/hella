/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {object} featureFlags
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {angular.$q} $q
   * @param {TaskGateway} taskGateway injected
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbViewHeater} pouchDbViewHeater
   */
  constructor(featureFlags, $scope, $state, $q, taskGateway, modalService, SelectionDialog, pouchDbContextService, pouchDbSyncManager, pouchDbViewHeater) {
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
     *
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     *
     * @type {PouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;

    /**
     *
     * @type {PouchDbViewHeater}
     * @private
     */
    this._pouchDbViewHeater = pouchDbViewHeater;

    /**
     * @type {Object}
     * @private
     */
    this._rawTasksById = {};

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

    // Reload upon request
    this._$scope.$on('task-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });
  }

  openTask(taskId) {
    // If this is the users task open it
    if (this._rawTasksById[taskId].isUsersTask(this.user)) {
      this._gotoTask(taskId, this.taskPhase);
      return;
    }

    // If it is not the users tasks check if assignment is possible
    if (this.userPermissions.canBeginTask && (!this._rawTasksById[taskId] || this._rawTasksById[taskId].isUserAllowedToAssign(this.user))) {
      this.loadingInProgress = true;
      this._taskGateway.assignAndMarkAsInProgress(taskId).then(() => {
        this._gotoTask(taskId, this.taskPhase);
      });
    } else {
      this._modalService.info(
        {
          title: 'Task is read-only',
          headline: 'This task is already assigned to someone else or you are not allowed to edit this task.',
          message: 'You are only allowed to open it in real only mode',
          confirmButtonText: 'Open read only',
        }, () => this._gotoTask(taskId, this.taskPhase)
      );
    }
  }

  _gotoTask(taskId, phase) {
    this._$state.go('labeling.tasks.detail', {taskId, phase});
  }

  /**
   * @param taskId
   * @private
   * @return {Promise}
   */
  _checkoutTaskFromRemote(taskId) {
    let dbContext;

    return this._$q.resolve()
      .then(() => this._pouchDbContextService.provideContextForTaskId(taskId));
      .then((_dbContext) => {
        dbContext = _dbContext;
        this._pouchDbSyncManager.
      });
    // sync designviews and taskdocuments in parallel
    // wait for sync complete
    // heat views when data complete and redirect to labeling.tasks.detail in parallel
  }

  unassignTask(taskId, assigneeId) {
    this._taskGateway.unassignUserFromTask(taskId, assigneeId)
      .then(() => this.updatePage(this._currentPage, this._currentItemsPerPage));
  }

  flagTask(taskId) {
    if (this._rawTasksById[taskId].taskAttentionFlag) {
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
          this._rawTasksById[task.id] = task;
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
  'taskGateway',
  'modalService',
  'SelectionDialog',
  'pouchDbContextService',
  'pouchDbSyncManager',
  'pouchDbViewHeater',
];

export default TaskListController;

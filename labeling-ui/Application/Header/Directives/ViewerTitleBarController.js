/**
 * Controller of the {@link ViewerTitleBarDirective}
 */
class ViewerTitleBarController {
  /**
   * @param {angular.$timeout} $timeout
   * @param {$rootScope.$scope} $scope
   * @param {$rootScope.$rootScope} $rootScope
   * @param {angular.$state} $state
   * @param {$q} $q
   * @param {Object} featureFlags
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {FrameIndexService} frameIndexService
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   */
  constructor($timeout,
              $scope,
              $rootScope,
              $state,
              $q,
              featureFlags,
              modalService,
              applicationState,
              taskGateway,
              labeledThingGateway,
              labeledThingInFrameGateway,
              frameIndexService,
              pouchDbSyncManager,
              pouchDbContextService) {
    this._$timeout = $timeout;
    /**
     * @param {angular.$scope} $scope
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$rootScope.$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @param {angular.$state} $state
     * @private
     */
    this._$state = $state;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Object}
     * @private
     */
    this._featureFlags = featureFlags;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ApplicationState}
     * @private
     */
    this._applicationState = applicationState;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * @type {string}
     */
    this.shapeBounds = null;

    /**
     * @type {{lowerLimit, upperLimit}|{lowerLimit: number, upperLimit: number}}
     */
    this.frameNumberLimits = this._frameIndexService.getFrameNumberLimits();

    /**
     * @type {PouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    this.refreshIncompleteCount();
    this._registerOnEvents();

    $scope.$watchGroup(['vm.selectedPaperShape.bounds.width', 'vm.selectedPaperShape.bounds.height'], newValues => {
      const width = newValues[0];
      const height = newValues[1];
      if (width && height) {
        this.shapeBounds = `${parseInt(width, 10)}px x ${parseInt(height, 10)}px`;
      } else {
        this.shapeBounds = null;
      }
    });

    $scope.$watchGroup(['vm.selectedPaperShape.dimensions.height2d', 'vm.selectedPaperShape.dimensions.height3d'], newValues => {
      const height2d = newValues[0];
      const height3d = newValues[1];
      if (height2d && height3d) {
        this.shapeBounds = `Height: ${parseInt(height2d, 10)}px (${height3d.toFixed(2)}m)`;
      } else {
        this.shapeBounds = null;
      }
    });

    if (this._featureFlags.pouchdb === true) {
      this.canFinishTask = false;

      this._pouchDbSyncManager.on('offline', () => {
        this.canFinishTask = false;
      });
      this._pouchDbSyncManager.on('alive', () => {
        this.canFinishTask = true;
      });
      this._pouchDbSyncManager.on('transfer', () => {
        this.canFinishTask = false;
      });
    }
  }

  _registerOnEvents() {
    this._$rootScope.$on('shape:class-update:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('shape:delete:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('shape:add:after', () => {
      this.refreshIncompleteCount();
    });
  }

  finishLabelingTask() {
    if (this._featureFlags.pouchdb === true && !this.canFinishTask) {
      this._modalService.info(
        {
          title: 'Database sync in progress',
          headline: 'There is still data synced to the server!',
          message: 'Please wait until all data is synced befor finishing the task. Syncstatus can be seen by the icon left of the timer.',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
      return;
    }

    this._applicationState.disableAll();
    this._applicationState.viewer.work();

    this._labeledThingGateway.getIncompleteLabeledThingCount(this.task.id).then(result => {
      if (result.count !== 0) {
        this.handleIncompleteState();
      } else {
        this.handleCompleteState();
      }
      this._applicationState.viewer.finish();
      this._applicationState.enableAll();
    });
  }

  handleCompleteState() {
    this._modalService.info(
      {
        title: 'Finish Task',
        headline: 'Mark this task as finished?',
        message: 'You are about to mark this task as being finished. After that it will be assigned back to the Label-Coordinator for review. You will not be able to change anything in this task from this point on.',
        confirmButtonText: 'Finish',
      },
      () => {
        this._pouchDbSyncManager.stopReplicationsForContext(this._pouchDbContextService.provideContextForTaskId(this.task.id));
        this._taskGateway.markTaskAsDone(this.task.id)
          .then(() => {
            this._$state.go('labeling.tasks.list', {projectId: this.task.projectId});
          })
          .catch(response => {
            if (response.status === 412) {
              this._modalService.info(
                {
                  title: 'Finish Task',
                  headline: 'Incomplete labeling data',
                  message: 'Not all labeling data is complete. In order to finish this task you need to complete all labels!',
                },
                () => this.handleIncompleteState(),
                undefined,
                {
                  warning: true,
                  abortable: false,
                }
              );
            }
          });
      }
    );
  }

  handleIncompleteState() {
    if (this.task.taskType === 'object-labeling') {
      this._labeledThingInFrameGateway.getNextIncomplete(this.task).then(labeledThingsInFrames => {
        const nextIncomplete = labeledThingsInFrames[0];

        if (this.framePosition.position === nextIncomplete.frameIndex) {
          this._selectLabeledThingInFrame(nextIncomplete);
        } else {
          this.framePosition.afterFrameChangeOnce('selectNextIncomplete', () => {
            this._selectLabeledThingInFrame(nextIncomplete);
          });
          this.framePosition.goto(nextIncomplete.frameIndex);
        }
      });
    }
  }

  _selectLabeledThingInFrame(nextIncomplete) {
    this._$timeout(() => {
      const labeledThingInFrame = this.labeledThingsInFrame.find(element => {
        return nextIncomplete.id === element.id;
      });
      const shape = labeledThingInFrame.paperShapes[0];
      this.selectedPaperShape = shape;
      this.hideLabeledThingsInFrame = true;
      this.thingLayer.update();
    });
  }

  reOpenLabelingTask() {
    this._modalService.info(
      {
        title: 'Reopen Task',
        headline: 'Reopen this labeling task?',
        message: 'You are about to reopen this tasked. After this operation the task will be editable again by the labeler.',
        confirmButtonText: 'Reopen',
      },
      () => {
        this._applicationState.disableAll();
        this._applicationState.viewer.work();
        this._taskGateway.markTaskAsTodo(this.task.id)
          .then(() => {
            this._$state.go('labeling.tasks');
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
          });
      }
    );
  }

  refreshIncompleteCount() {
    this._$scope.$applyAsync(() => {
      this._labeledThingGateway.getIncompleteLabeledThingCount(this.task.id).then(result => {
        this.incompleteCount = result.count;
      });
    });
  }

  goBackToTasksList() {
    if (this._featureFlags.pouchdb === true) {
      if (!this.canFinishTask) {
        this._modalService.info(
          {
            title: 'Database sync in progress',
            headline: 'There is still data synced to the server!',
            message: 'Please wait until all data is synced befor finishing the task. Syncstatus can be seen by the icon left of the timer.',
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
        return;
      }

      this._pouchDbSyncManager.stopReplicationsForContext(this._pouchDbContextService.provideContextForTaskId(this.task.id));
    }

    this._$state.go('labeling.tasks.list', {project: this.task.projectId});
  }
}

ViewerTitleBarController.$inject = [
  '$timeout',
  '$scope',
  '$rootScope',
  '$state',
  '$q',
  'featureFlags',
  'modalService',
  'applicationState',
  'taskGateway',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
  'frameIndexService',
  'pouchDbSyncManager',
  'pouchDbContextService',
];

export default ViewerTitleBarController;

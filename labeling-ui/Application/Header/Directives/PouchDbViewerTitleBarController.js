import ViewerTitleBarController from './ViewerTitleBarController';
/**
 * Controller of the {@link PouchDbViewerTitleBarDirective}
 */
class PouchDbViewerTitleBarController extends ViewerTitleBarController {
  /**
   * @param {angular.$timeout} $timeout
   * @param {$rootScope.$scope} $scope
   * @param {$rootScope.$rootScope} $rootScope
   * @param {angular.$state} $state
   * @param {$q} $q
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {FrameIndexService} frameIndexService
   * @param {Object} featureFlags
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {ApplicationLoadingMaskService} applicationLoadingMaskService
   */
  constructor($timeout,
              $scope,
              $rootScope,
              $state,
              $q,
              modalService,
              applicationState,
              taskGateway,
              labeledThingGateway,
              labeledThingInFrameGateway,
              frameIndexService,
              featureFlags,
              pouchDbSyncManager,
              pouchDbContextService,
              applicationLoadingMaskService) {
    super(
      $timeout,
      $scope,
      $rootScope,
      $state,
      $q,
      modalService,
      applicationState,
      taskGateway,
      labeledThingGateway,
      labeledThingInFrameGateway,
      frameIndexService,
      featureFlags
    );

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

    /**
     * @type {ApplicationLoadingMaskService}
     * @private
     */
    this._applicationLoadingMaskService = applicationLoadingMaskService;
  }

  /**
   * Push all outstanding changes to the backend
   *
   * @returns {Promise.<Event>}
   * @private
   */
  _pushChangesToBackend() {
    const context = this._pouchDbContextService.provideContextForTaskId(this.task.id);
    this._pouchDbSyncManager.stopReplicationsForContext(context);
    return this._pouchDbSyncManager.pushUpdatesForContext(context);
  }

  /**
   * Pull all outstanding changes from the backend
   *
   * @returns {Promise.<Event>}
   * @private
   */
  _pullChangesFromBackend() {
    const context = this._pouchDbContextService.provideContextForTaskId(this.task.id);
    this._pouchDbSyncManager.stopReplicationsForContext(context);
    return this._pouchDbSyncManager.pushUpdatesForContext(context);
  }

  /**
   * Ensure a continuous replication with the backend is active
   *
   * @private
   */
  _reinitializeContinuousReplication() {
    const context = this._pouchDbContextService.provideContextForTaskId(this.task.id);
    this._pouchDbSyncManager.stopReplicationsForContext(context);
    this._pouchDbSyncManager.startDuplexLiveReplication(context);
  }

  /**
   * Handle the click to the "finish labeling task button"
   *
   * This button either jumps to the next incomplete shape, if there still is one in the task
   * or
   * it asks the user to really finish up the tasks and acts accordingly.
   */
  onFinishLabelingTaskButtonClicked() {
    this._applicationState.disableAll();
    this._applicationState.viewer.work();

    return this._$q.resolve()
      .then(() => this._pushChangesToBackend())
      .then(() => this._labeledThingGateway.getIncompleteLabeledThingCount(this.task.id))
      .then(result => {
        if (result.count > 0) {
          // Jump to next incomplete directly, if there still is one
          return this._jumpToNextIncomplete();
        }
        // If everything seems to be completed ask the user to really finish up the task.
        return this._askToReallyFinishTask();
      })
      .then(() => {
        this._applicationState.viewer.finish();
        this._applicationState.enableAll();
      })
      .catch(() => {
        this._applicationState.viewer.finish();
        this._applicationState.enableAll();
      });
  }

  /**
   * Jump to the next incomplete ltif
   *
   * A promise is returned, which is fulfilled once the jump and selection is completed.
   *
   * @return {Promise}
   * @protected
   */
  _jumpToNextIncomplete() {
    return super._jumpToNextIncomplete()
      .then(() => this._pullChangesFromBackend())
      .then(() => this._reinitializeContinuousReplication());
  }

  /**
   * Return to the task list
   */
  goBackToTasksList() {
    // @TODO: What if someone uses the browser back button?
    this._applicationLoadingMaskService.startLoading('Saving task data...');
    this._$q.resolve()
      .then(() => this._pushChangesToBackend())
      .then(() => {
        this._$state.go('labeling.tasks.list', {project: this.task.projectId});
        this._applicationLoadingMaskService.finishLoading();
      });
  }
}

PouchDbViewerTitleBarController.$inject = ViewerTitleBarController.$inject.concat([
  'pouchDbSyncManager',
  'pouchDbContextService',
  'applicationLoadingMaskService',
]);

export default PouchDbViewerTitleBarController;

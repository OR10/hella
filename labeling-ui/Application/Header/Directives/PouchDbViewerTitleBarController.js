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
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {FrameIndexService} frameIndexService
   * @param {Object} featureFlags
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {ApplicationLoadingMaskService} applicationLoadingMaskService
   * @param {ImageCache} imageCache
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
              labeledFrameGateway,
              frameIndexService,
              featureFlags,
              pouchDbSyncManager,
              pouchDbContextService,
              applicationLoadingMaskService,
              imageCache) {
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
      labeledFrameGateway,
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

    /**
     * @type {LabeledFrameGateway}
     * @private
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {ImageCache}
     * @private
     */
    this._imageCache = imageCache;
  }

  /**
   * Handle all tasks needed to be completed before leaving the task
   *
   * @returns {Promise.<Event>}
   * @private
   */
  _beforeTaskLeave() {
    const context = this._pouchDbContextService.provideContextForTaskId(this.task.id);
    this._pouchDbSyncManager.stopReplicationsForContext(context);

    return this._$q.all([
      this._pouchDbSyncManager.pushUpdatesForContext(context),
      this._imageCache.clear(),
    ]);
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
    return this._pouchDbSyncManager.pullUpdatesForContext(context);
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
      .then(() => this._beforeTaskLeave())
      .then(() => {
        return this._getComposedIncompleteCount(this.task);
      })
      .then(composedIncompleteCount => {
        if (composedIncompleteCount > 0) {
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
   * Get the incomplete count for all different labeled object.
   * The following objects are currently used:
   * - LabeledThings
   * - LabeledFrames
   *
   * @param {Task} task
   * @return {number}
   * @private
   */
  _getComposedIncompleteCount(task) {
    return this._$q.all([
      this._labeledThingGateway.getIncompleteLabeledThingCount(task),
      this._labeledFrameGateway.getIncompleteLabeledFrameCount(task),
    ])
      .then(([thingIncompleteResult, frameIncompleteResult]) => {
        return thingIncompleteResult.count + frameIncompleteResult.count;
      });
  }

  /**
   * Jump to the next incomplete labeled object
   *
   * A promise is returned, which is fulfilled once the jump and selection is completed.
   *
   * @return {Promise}
   * @protected
   */
  _jumpToNextIncomplete() {
    return this._$q.all([
      this._labeledThingGateway.getIncompleteLabeledThingCount(this.task),
      this._labeledFrameGateway.getIncompleteLabeledFrameCount(this.task),
    ])
      .then(([incompleteThingResponse, incompleteFrameResponse]) => {
        if (incompleteFrameResponse.count > 0) {
          return this._jumpToNextIncompleteFrame();
        }
        if (incompleteThingResponse.count > 0) {
          return this._jumpToNextIncompleteThing();
        }
      })
      .then(() => this._pullChangesFromBackend())
      .then(() => this._reinitializeContinuousReplication());
  }

  /**
   * Update the count of incomplete objects
   */
  refreshIncompleteCount() {
    this._$scope.$applyAsync(() => {
      this._getComposedIncompleteCount(this.task).then(incompleteCount => {
        this.incompleteCount = incompleteCount;
      });
    });
  }

  /**
   * Return to the task list
   */
  goBackToTasksList() {
    // @TODO: What if someone uses the browser back button?
    this._applicationLoadingMaskService.startLoading('Saving task data...');
    this._$q.resolve()
      .then(() => this._beforeTaskLeave())
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
  'imageCache',
]);

export default PouchDbViewerTitleBarController;

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
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledFrameGateway} labeledFrameGateway
   * @param {FrameIndexService} frameIndexService
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {ApplicationLoadingMaskService} applicationLoadingMaskService
   * @param {ImageCache} imageCache
   * @param {ImagePreloader} imagePreloader
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
              pouchDbSyncManager,
              pouchDbContextService,
              applicationLoadingMaskService,
              imageCache,
              imagePreloader) {
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
     * @protected
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {LabeledFrameGateway}
     * @protected
     */
    this._labeledFrameGateway = labeledFrameGateway;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

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

    /**
     * @type {ImagePreloader}
     * @private
     */
    this._imagePreloader = imagePreloader;

    /**
     * @type {string}
     */
    this.shapeBounds = null;

    /**
     * @type {string}
     */
    this.shapeFrameRange = null;

    /**
     * @type {{lowerLimit, upperLimit}|{lowerLimit: number, upperLimit: number}}
     */
    this.frameNumberLimits = this._frameIndexService.getFrameNumberLimits();

    this.refreshIncompleteCount();
    this._registerOnEvents();

    $scope.$watchGroup(
      ['vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex', 'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameIndex'],
      newValues => {
        const start = this._frameIndexService.getFrameNumber(newValues[0]);
        const end = this._frameIndexService.getFrameNumber(newValues[1]);
        if (start && end) {
          this.shapeFrameRange = `${start}-${end}`;
        } else {
          this.shapeFrameRange = null;
        }
      }
    );

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
      this._imagePreloader.stopPreloadingForTask(this.task),
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

  _registerOnEvents() {
    this._$rootScope.$on('shape:class-update:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('framerange:change:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('shape:delete:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('shape:add:after', () => {
      this.refreshIncompleteCount();
    });
    this._$rootScope.$on('shape:merge:after', () => {
      this.refreshIncompleteCount();
    });
  }

  /**
   * Ask the user if he/she wants to really finish the task and take appropriate actions based on the answer
   *
   * A Promise will be returned, which is fulfilled once the asking and processing of the answer is finsihed.
   *
   * @return {Promise}
   * @protected
   */
  _askToReallyFinishTask() {
    return this._$q(resolve => {
      this._modalService.info(
        {
          title: 'Finish Task',
          headline: 'Mark this task as finished?',
          message: 'You are about to mark this task as being finished. After that it will be assigned back to the Label Manager for review. You will not be able to change anything in this task from this point on.',
          confirmButtonText: 'Finish',
        },
        () => {
          this._taskGateway.markTaskAsDone(this.task.id)
            .then(() => {
              this._$state.go('labeling.tasks.list', {projectId: this.task.projectId});
            })
            .catch(response => {
              if (response.status === 412) {
                // If the task could not be finished, because there were still incomplete ltifs we inform the user and
                // have him fix the problem
                return this._informAboutIncompleteLabeledObjects()
                  .then(() => this._jumpToNextIncomplete());
              }
            })
            .then(() => resolve());
        },
        () => {
          this._reinitializeContinuousReplication();

          resolve();
        }
      );
    });
  }

  /**
   * Display an information dialog telling the user, there are still incomplete ltifs in the task
   *
   * A Promise is returned, which is fulfilled once the user clicked the okay button.
   * The Dialog can not be aborted or dismissed.
   *
   * @returns {Promise}
   * @protected
   */
  _informAboutIncompleteLabeledObjects() {
    return this._$q(resolve => {
      this._modalService.info(
        {
          title: 'Finish Task',
          headline: 'Incomplete labeling data',
          message: 'Not all labeling data is complete. In order to finish this task you need to complete all labels!',
        },
        () => resolve(),
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
    });
  }

  /**
   * Load the next incomplete labeled thing, jump to the frameIndex of this labeled thing and select it.
   *
   * @return {Promise}
   * @protected
   */
  _jumpToNextIncompleteThing() {
    return this._$q.resolve()
      .then(() => this._labeledThingInFrameGateway.getNextIncomplete(this.task))
      .then(labeledThingsInFrames => {
        if (labeledThingsInFrames.length === 0) {
          return this._$q.resolve();
        }

        const nextIncomplete = labeledThingsInFrames[0];

        if (this.framePosition.position === nextIncomplete.frameIndex) {
          // Incomplete Ltif is on the same frame
          return this._selectLabeledThingInFrame(nextIncomplete);
        }

        // Change frame to ltif position and select it then.
        return this._$q(resolve => {
          this.framePosition.afterFrameChangeOnce('selectNextIncomplete', () => {
            this._selectLabeledThingInFrame(nextIncomplete)
              .then(() => resolve());
          });
          this.framePosition.goto(nextIncomplete.frameIndex);
        });
      });
  }

  /**
   * Load the next incomplete labeled frame, jump to the frameIndex of this labeled frame and enable meta labeling.
   *
   * @return {Promise}
   * @protected
   */
  _jumpToNextIncompleteFrame() {
    return this._$q.resolve()
      .then(() => this._labeledFrameGateway.getNextIncomplete(this.task))
      .then(labeledFrames => {
        if (labeledFrames.length === 0) {
          return this._$q.resolve();
        }
        const nextIncomplete = labeledFrames[0];

        if (this.framePosition.position === nextIncomplete.frameIndex) {
          // Incomplete frame is the current frame
          this._$rootScope.$emit('label-structure-type:change', nextIncomplete);
          return this._$q.resolve();
        }

        return this._$q(resolve => {
          this.framePosition.afterFrameChangeOnce('selectNextIncomplete', () => {
            this._$rootScope.$emit('label-structure-type:change', nextIncomplete);
            resolve();
          });
          this.framePosition.goto(nextIncomplete.frameIndex);
        });
      });
  }

  /**
   * Select a specific {@link LabeledThingInFrame} on the current frame
   *
   * A promise is returned, which is fulfilled after the selection has been rendered.
   *
   * @param {LabeledThingInFrame} nextIncomplete
   * @returns {Promise}
   * @private
   */
  _selectLabeledThingInFrame(nextIncomplete) {
    return this._$q(resolve => {
      this._$timeout(() => {
        const paperThingShape = this.paperThingShapes.find(thingShape => {
          return nextIncomplete.id === thingShape.labeledThingInFrame.id;
        });
        this.selectedPaperShape = paperThingShape;
        this.hideLabeledThingsInFrame = true;
        this.thingLayer.update();
        resolve();
      });
    });
  }
}

ViewerTitleBarController.$inject = [
  '$timeout',
  '$scope',
  '$rootScope',
  '$state',
  '$q',
  'modalService',
  'applicationState',
  'taskGateway',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
  'labeledFrameGateway',
  'frameIndexService',
  'pouchDbSyncManager',
  'pouchDbContextService',
  'applicationLoadingMaskService',
  'imageCache',
  'imagePreloader',
];

export default ViewerTitleBarController;

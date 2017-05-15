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
   * @param {FrameIndexService} frameIndexService
   * @param {Object} featureFlags
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
              featureFlags) {
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
     * @type {Object}
     */
    this.featureFlags = featureFlags;

    /**
     * @type {string}
     */
    this.shapeBounds = null;

    /**
     * @type {{lowerLimit, upperLimit}|{lowerLimit: number, upperLimit: number}}
     */
    this.frameNumberLimits = this._frameIndexService.getFrameNumberLimits();

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
      .then(() => this._labeledThingGateway.getIncompleteLabeledThingCount(this.task))
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
          message: 'You are about to mark this task as being finished. After that it will be assigned back to the Label-Coordinator for review. You will not be able to change anything in this task from this point on.',
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
        () => resolve()
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
   * Jump to the next incomplete ltif
   *
   * A promise is returned, which is fulfilled once the jump and selection is completed.
   *
   * @return {Promise}
   * @protected
   */
  _jumpToNextIncomplete() {
    if (this.task.taskType !== 'object-labeling') {
      return this._$q.resolve();
    }

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
      this._labeledThingGateway.getIncompleteLabeledThingCount(this.task).then(result => {
        this.incompleteCount = result.count;
      });
    });
  }

  goBackToTasksList() {
    this._$state.go('labeling.tasks.list', {project: this.task.projectId});
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
  'frameIndexService',
  'featureFlags',
];

export default ViewerTitleBarController;

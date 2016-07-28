/**
 * Controller of the {@link ViewerTitleBarDirective}
 */
class ViewerTitleBarController {
  /**
   * @param {angular.$timeout} $timeout
   * @param {$rootScope.$scope} $scope
   * @param {$rootScope.$rootScope} $rootScope
   * @param {angular.$state} $state
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {FrameIndexService} frameIndexService
   */
  constructor($timeout,
              $scope,
              $rootScope,
              $state,
              modalService,
              applicationState,
              taskGateway,
              labeledThingGateway,
              labeledThingInFrameGateway,
              frameIndexService) {
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
    this._applicationState.disableAll();
    this._applicationState.viewer.work();

    this._labeledThingGateway.getIncompleteLabelThingCount(this.task.id).then(result => {
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
    const modal = this._modalService.getInfoDialog(
      {
        title: 'Finish Task',
        headline: 'Mark this task as finished?',
        message: 'You are about to mark this task as being finished. After that it will be assigned back to the Label-Coordinator for review. You will not be able to change anything in this task from this point on.',
        confirmButtonText: 'Finish',
        cancelButtonText: 'Cancel',
      },
      () => {
        this._taskGateway.markTaskAsDone(this.task.id)
          .then(() => {
            this._$state.go('labeling.tasks.list', {projectId: this.task.projectId});
          })
          .catch(response => {
            if (response.status === 412) {
              const alert = this._modalService.getAlertWarningDialog({
                title: 'Finish Task',
                headline: 'Incomplete labeling data',
                message: 'Not all labeling data is complete. In order to finish this task you need to complete all labels!',
                confirmButtonText: 'Ok',
              }, this.handleIncompleteState());
              alert.activate();
            }
          });
      },
      () => {
      }
    );
    modal.activate();
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
    const modal = this._modalService.getInfoDialog(
      {
        title: 'Reopen Task',
        headline: 'Reopen this labeling task?',
        message: 'You are about to reopen this tasked. After this operation the task will be editable again by the labeler.',
        confirmButtonText: 'Reopen',
        cancelButtonText: 'Cancel',
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
    modal.activate();
  }

  refreshIncompleteCount() {
    this._$scope.$applyAsync(() => {
      this._labeledThingGateway.getIncompleteLabelThingCount(this.task.id).then(result => {
        this.incompleteCount = result.count;
      });
    });
  }
}

ViewerTitleBarController.$inject = [
  '$timeout',
  '$scope',
  '$rootScope',
  '$state',
  'modalService',
  'applicationState',
  'taskGateway',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
  'frameIndexService',
];

export default ViewerTitleBarController;

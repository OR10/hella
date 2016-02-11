/**
 * Controller of the {@link ViewerTitleBarDirective}
 */
class ViewerTitleBarController {
  /**
   * @param {angular.$location} $location
   * @param {angular.$timeout} $timeout
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param {ReleaseConfigService} releaseConfigService
   */
  constructor($timeout, $scope, $state, modalService, applicationState, taskGateway, labeledThingGateway, labeledThingInFrameGateway) {
    this._$timeout = $timeout;
    /**
     * @param {angular.$scope} $scope
     * @private
     */
    this._$scope = $scope;

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
     * @type {string}
     */
    this.shapeBounds = null;

    this.refreshIncompleteCount();
    $scope.$watch('vm.selectedPaperShape', this.refreshIncompleteCount.bind(this));

    $scope.$watchGroup(['vm.selectedPaperShape.bounds.width', 'vm.selectedPaperShape.bounds.height'], (newValues) => {
      const width = newValues[0];
      const height = newValues[1];
      if (width && height) {
        this.shapeBounds = `${parseInt(width, 10)}px x ${parseInt(height, 10)}px`;
      } else {
        this.shapeBounds = null;
      }
    });

  }

  finishLabelingTask() {
    this._applicationState.disableAll();
    this._applicationState.viewer.work();

    this._labeledThingGateway.getIncompleteLabelThingCount(this.task.id).then((result) => {
      if (result.count !== 0) {
        this.handleIncompleteState();
      } else {
        this.handleCompleteState();
      }
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
        this._taskGateway.markTaskAsLabeled(this.task)
          .then(() => {
            this._$state.go('labeling.tasks');
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
          }).catch((response) => {
          if (response.status === 412) {
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
            const alert = this._modalService.getAlertWarningDialog({
              title: 'Finish Task',
              headline: 'Incomplete labeling data',
              message: 'Not all labeling data is complete. In order to finish this task you need to complete all labels!',
              confirmButtonText: 'Ok',
            }, this.handleIncompleteState());
            alert.activate();
          }
        });
      }
    );
    modal.activate();
  }

  handleIncompleteState() {
    this._applicationState.viewer.finish();
    this._applicationState.enableAll();

    if (this.task.taskType === 'object-labeling') {
      this._labeledThingInFrameGateway.getNextIncomplete(this.task).then((result) => {
        const nextIncomplete = result[0];
        this.framePosition.goto(nextIncomplete.frameNumber, true);

        this.framePosition.onFrameChangeComplete('selectNextIncomplete', () => {
          this._$timeout(() => {
            const labeledThingInFrame = this.labeledThingsInFrame.find((element) => {
              return nextIncomplete.id === element.id;
            });
            const shape = labeledThingInFrame.paperShapes[0];
            shape.select();
            this.thingLayer.update();
            this.selectedPaperShape = shape;
          });
        });
      });
    }
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
        this._taskGateway.markTaskAsWaiting(this.task)
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
    this._labeledThingGateway.getIncompleteLabelThingCount(this.task.id).then((result) => {
      this.incompleteCount = result.count;
    });
  }

}

ViewerTitleBarController.$inject = [
  '$timeout',
  '$scope',
  '$state',
  'modalService',
  'applicationState',
  'taskGateway',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
];

export default ViewerTitleBarController;

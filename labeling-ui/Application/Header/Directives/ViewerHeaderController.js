/**
 * Controller of the {@link ViewerHeaderDirective}
 */
class ViewerHeaderController {
  /**
   * @param {angular.$location} $location
   * @param {angular.$timeout} $timeout
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param {ReleaseConfigService} releaseConfigService
   */
  constructor($state, modalService, applicationState, taskGateway) {
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
  }

  finishLabelingTask() {
    const modal = this._modalService.getInfoDialog(
      {
        title: 'Finish Task',
        headline: 'Mark this task as finished?',
        message: 'You are about to mark this task as being finished. After that it will be assigned back to the Label-Coordinator for review. You will not be able to change anything in this task from this point on.',
        confirmButtonText: 'Finish',
        cancelButtonText: 'Cancel',
      },
      () => {
        this._applicationState.disableAll();
        this._applicationState.viewer.work();
        this._taskGateway.markTaskAsLabeled(this.task)
          .then(() => {
            this._$state.go('labeling.tasks');
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
          });
      }
    );
    modal.activate();
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
}

ViewerHeaderController.$inject = [
  '$state',
  'modalService',
  'applicationState',
  'taskGateway',
];

export default ViewerHeaderController;

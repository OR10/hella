/**
 * Controller of the {@link HeaderDirective}
 */
class HeaderController {
  /**
   * @param {angular.$location} $location
   * @param {angular.$timeout} $timeout
   * @param {ModalService} modalService
   * @param {ApplicationState} applicationState
   * @param {TaskGateway} taskGateway
   * @param {ReleaseConfigService} releaseConfigService
   */
  constructor($location, $timeout, modalService, applicationState, taskGateway, releaseConfigService) {
    /**
     * @type {angular.$location}
     * @private
     */
    this._$location = $location;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

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
     * @type {ReleaseConfigService}
     * @private
     */
    this._releaseConfigService = releaseConfigService;

    /**
     * @type {null|object}
     */
    this.releaseInformation = null;

    /**
     * @type {Promise|null}
     * @private
     */
    this._releaseInformationTimeout = null;
  }

  handleLogoutClick() {
    const modal = this._modalService.getInfoDialog({
      title: 'Logout',
      headline: 'Do you want to log out?',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
    }, () => {
      this._$location.path('/logout');
    });
    modal.activate();
  }

  showReleaseInformation() {
    this._releaseConfigService.getReleaseConfig().then(releaseConfig => {
      if (this._releaseInformationTimeout !== null) {
        this._$timeout.cancel(this._releaseInformationTimeout);
      }
      this.releaseInformation = releaseConfig;
      this._releaseInformationTimeout = this._$timeout(() => this.releaseInformation = null, 6000);
    });
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
            this._$location.path('/labeling/tasks');
            this._applicationState.viewer.finish();
            this._applicationState.enableAll();
          });
      }
    );
    modal.activate();
  }
}

HeaderController.$inject = [
  '$location',
  '$timeout',
  'modalService',
  'applicationState',
  'taskGateway',
  'releaseConfigService',
];

export default HeaderController;

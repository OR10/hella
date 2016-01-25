/**
 * Controller of the {@link TaskTitleDirective}
 */
class TaskTitleController {
  /**
   *
   * @param {angular.$timeout} $timeout
   * @param {ReleaseConfigService} releaseConfigService
   */
  constructor($timeout, releaseConfigService) {
    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

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

  showReleaseInformation() {
    this._releaseConfigService.getReleaseConfig().then(releaseConfig => {
      if (this._releaseInformationTimeout !== null) {
        this._$timeout.cancel(this._releaseInformationTimeout);
      }
      this.releaseInformation = releaseConfig;
      this._releaseInformationTimeout = this._$timeout(() => this.releaseInformation = null, 6000);
    });
  }
}

TaskTitleController.$inject = [
  '$timeout',
  'releaseConfigService',
];

export default TaskTitleController;

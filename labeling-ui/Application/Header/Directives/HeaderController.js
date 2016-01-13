/**
 * Controller of the {@link HeaderDirective}
 */
class HeaderController {
  /**
   * @param {ModalService} modalService
   * @param {ReleaseConfigService} releaseConfigService
   * @param {$timeout} $timeout
   */
  constructor(modalService, releaseConfigService, $timeout) {
    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ReleaseConfigService}
     * @private
     */
    this._releaseConfigService = releaseConfigService;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

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
      window.location.assign('/logout');
    });
    modal.activate();
  }

  handleTitleClick(event) {
    const timesClicked = event.originalEvent.detail || 0;

    if (timesClicked === 4) {
      this._releaseConfigService.getReleaseConfig().then(releaseConfig => {
        if (this._releaseInformationTimeout !== null) {
          this._$timeout.cancel(this._releaseInformationTimeout);
        }
        this.releaseInformation = releaseConfig;
        this._releaseInformationTimeout = this._$timeout(() => this.releaseInformation = null, 3000);
      });
    }
  }
}

HeaderController.$inject = [
  'modalService',
  'releaseConfigService',
  '$timeout',
];

export default HeaderController;

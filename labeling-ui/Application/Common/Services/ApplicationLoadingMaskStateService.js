class ApplicationLoadingMaskStateService {
  /**
   * @param {ApplicationLoadingMaskService} applicationLoadingMaskService
   */
  constructor(applicationLoadingMaskService) {
    /**
     * @type {ApplicationLoadingMaskService}
     * @private
     */
    this._applicationLoadingMaskService = applicationLoadingMaskService;

    /**
     * @type {string}
     * @private
     */
    this._message = '';
  }

  /**
   * @param {string} message
   */
  setMessage(message) {
    this._message = message;
  }

  /**
   * @param {Object} event
   * @param {Object} toState
   */
  stateChangeStart(event, toState) {
    const showLoadingMask = toState.applicationLoadingMask && toState.applicationLoadingMask === true;

    let message = toState.loadingMessage ? toState.loadingMessage : '';
    if (this._message !== '') {
      message = this._message;
    }

    if (showLoadingMask) {
      this._applicationLoadingMaskService.startLoading(message);
    }
  }

  stateChangeSuccess() {
    this._applicationLoadingMaskService.finishLoading();
    this._message = '';
  }

  stateChangeError() {
    this._applicationLoadingMaskService.finishLoading();
    this._message = '';
  }
}

ApplicationLoadingMaskStateService.$inject = [
  'applicationLoadingMaskService',
];

export default ApplicationLoadingMaskStateService;

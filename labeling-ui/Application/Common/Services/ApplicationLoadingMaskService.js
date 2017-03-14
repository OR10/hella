class ApplicationLoadingMaskService {
  constructor() {
    /**
     * @type {string}
     */
    this._message = '';

    /**
     * @type {boolean}
     */
    this._showLoadingMask = false;
  }

  /**
   * @return {boolean}
   */
  get showLoadingMask() {
    return this._showLoadingMask;
  }

  /**
   * @return {string}
   */
  get message() {
    return this._message;
  }

  /**
   * @param {string} message
   */
  startLoading(message = '') {
    this._showLoadingMask = true;
    this._message = message;
  }

  finishLoading() {
    this._showLoadingMask = false;
    this._message = '';
  }
}

ApplicationLoadingMaskService.$inject = [];

export default ApplicationLoadingMaskService;

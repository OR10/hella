/**
 * Gateway for logging messages to the backend
 */
class LogGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;
  }


  /**
   * Logs a message to the backend
   *
   * @param {Object} message
   * @returns {AbortablePromise<Status|Error>}
   */
  logMessage(message) {
    const url = this._apiService.getApiUrl(
      `/v1/uiLog`
    );
    return this._bufferedHttp.post(url, {log: [message]}, undefined, 'log')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed saving log message`);
      });
  }

}

LogGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LogGateway;

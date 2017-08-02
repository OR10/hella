/**
 * Gateway for managing User information
 */
class SystemGateway {
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
   * Gets queue status information
   *
   * @return {AbortablePromise<User|Error>}
   */
  getQueueStatus() {
    const url = this._apiService.getApiUrl('/v1/system/queues');
    return this._bufferedHttp.get(url, undefined, 'system')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading queue status information');
      });
  }

  /**
   * Checks if the accumulated health status of the application is healthy
   *
   * @return {AbortablePromise}
   */
  isSystemHealthy() {
    const url = this._apiService.getMonitorUrl('/health/http_status_checks');
    return this._bufferedHttp.get(url, undefined, 'system')
      .then(response => {
        return response.status === 200;
      });
  }
}

SystemGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default SystemGateway;

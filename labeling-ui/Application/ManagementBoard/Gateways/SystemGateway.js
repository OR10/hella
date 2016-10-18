import User from '../Models/User';

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
    const url = this._apiService.getApiUrl('/system/queues');
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading queue status information');
      });
  }
}

SystemGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default SystemGateway;

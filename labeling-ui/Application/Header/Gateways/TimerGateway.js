/**
 * Gateway for retrieving timer data
 */
class TimerGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Gets the time for the given {@link Task}
   *
   * @param {string} taskId
   * @param {string} userId
   * @return {AbortablePromise<int|Error>}
   */
  getTime(taskId, userId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/timer/${userId}`);
    return this._bufferedHttp.get(url, undefined, 'timer')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading time');
      });
  }

  /**
   * Starts export for the given {@link Task} and export type
   *
   * @param {string} taskId
   * @param {string} userId
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(taskId, userId, time) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/timer/${userId}`);
    return this._bufferedHttp.put(url, {time}, undefined, 'timer')
      .then(response => {
        if (response.data && response.data.message) {
          return response.data.message;
        }

        throw new Error('Failed saving time');
      });
  }
}

TimerGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TimerGateway;

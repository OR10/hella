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
   * @param {Task} task
   * @param {User} user
   * @return {AbortablePromise<int|Error>}
   */
  getTime(task, user) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/timer/${user.id}`);
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
   * @param {Task} task
   * @param {User} user
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(task, user, time) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/timer/${user.id}`);
    return this._bufferedHttp.put(url, {time}, undefined, 'timer')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
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

/**
 * Gateway for retrieving information about Tasks
 */
class TaskGateway {
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
   * Retrieves a list of available {@link Task}s
   *
   * @return {AbortablePromise<Task[]|Error>}
   */
  getTasks() {
    const url = this._apiService.getApiUrl('/task');
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result && response.data.result.tasks) {
          return response.data.result.tasks;
        }

        throw new Error('Failed loading task list');
      });
  }

  /**
   * Retrieves the {@link Task} identified by the given `id`
   *
   * @param {string} id
   *
   * @return {AbortablePromise.<Task|Error>}
   */
  getTask(id) {
    const url = this._apiService.getApiUrl(`/task/${id}`);
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${id}`);
      });
  }
}

TaskGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TaskGateway;

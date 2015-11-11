/**
 * Gateway for retrieving information about Tasks
 */
class TaskGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {angular.$http} $http
   */
  constructor(apiService, $http) {
    /**
     * @type {angular.$http}
     */
    this._$http = $http;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Retrieves a list of available {@link Task}s
   *
   * @return {Promise<Task[]|Error>}
   */
  getTasks() {
    const url = this._apiService.getApiUrl('/task');
    return this._$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading task list');
      });
  }

  /**
   * Retrieves the {@link Task} identified by the given `id`
   *
   * @param {string} id
   *
   * @return {Promise.<Task|Error>}
   */
  getTask(id) {
    const url = this._apiService.getApiUrl(`/task/${id}`);
    return this._$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${id}`);
      });
  }
}

TaskGateway.$inject = ['ApiService', '$http'];

export default TaskGateway;

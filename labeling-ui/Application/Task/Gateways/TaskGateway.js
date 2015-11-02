/**
 * Gateway for retrieving information about Tasks
 */
export default class TaskGateway {
  constructor(apiService, $http) {
    this.$http = $http;
    this.apiService = apiService;
  }

  /**
   * Returns the list of available tasks
   *
   * @return {Promise<Task[]|Error>}
   */
  getTasks() {
    const url = this.apiService.getApiUrl('/task');
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading task list');
      });
  }

  /**
   * Returns the task identified by the given id
   *
   * @param {String} id
   *
   * @return {Promise<Task|Error>}
   */
  getTask(id) {
    const url = this.apiService.getApiUrl(`/task/${id}`);
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${id}`);
      });
  }
}

TaskGateway.$inject = ['ApiService', '$http'];

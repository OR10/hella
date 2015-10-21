/**
 * @class TaskService
 *
 * Service for retrieving information about Tasks
 */
export default class TaskService {
  constructor($http) {
    this.$http = $http;
  }

  /**
   * Returns the list of available tasks
   *
   * @return {Promise<Task[]|Error>}
   */
  getTasks() {
    return this.$http.get('/api/task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }
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
    return this.$http.get(`/api/task/${id}`)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }
      });
  }
}

TaskService.$inject = ['$http'];

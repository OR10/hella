export default class TaskService {
  constructor($http) {
    this.$http = $http;
  }

  /**
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

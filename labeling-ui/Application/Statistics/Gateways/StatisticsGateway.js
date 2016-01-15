/**
 * Gateway for requesting task statistics information
 */
class StatisticsGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.$http} $http
   */
  constructor(apiService, $http) {
    this._$http = $http;
    this._apiService = apiService;
  }

  /**
   * @returns {Promise<Array<TaskStatistics>>}
   */
  getTaskStatistics() {
    const url = this._apiService.getApiUrl('/statistics/tasks');

    return this._$http.get(url)
      .then(response => response.data.result);
  }
}

StatisticsGateway.$inject = ['ApiService', '$http'];

export default StatisticsGateway;

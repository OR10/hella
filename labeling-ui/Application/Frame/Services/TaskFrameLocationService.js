/**
 * Service to interact with {@link Task} related {@link Frame}s
 */
export default class TaskFrameLocationService {
  /**
   * @param {ApiService} apiService
   * @param {angular.$http} $http
   */
  constructor(apiService, $http) {
    this.apiService = apiService;
    this.$http = $http;
  }

  /**
   *
   * @param {string} taskId
   * @param {string} type
   * @param {number?} offset
   * @param {number?} limit
   * @return {Promise<Array<FrameLocation>>}
   */
  getFrameLocations(taskId, type, offset = 0, limit = 1) {
    return this.$http({
      method: 'GET',
      url: this.apiService.getApiUrl(
        `/task/${taskId}/frameLocations/${type}`,
        {offset, limit}
      ),
    })
      .then(response => {
        return response.data.result;
      });
  }
}

TaskFrameLocationService.$inject = ['ApiService', '$http'];

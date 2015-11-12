/**
 * Gateway to interact with {@link Task} related {@link Frame}s
 */
class TaskFrameLocationGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {angular.$http} $http injected
   */
  constructor(apiService, $http) {
    this._apiService = apiService;
    this.$http = $http;
  }

  /**
   * Retrieve CDN {@link FrameLocation}s for a specific set of frames of one {@link Task}
   *
   * If `offset` is not given `0` is used as a default
   *
   * If `limit` is not given `1` is used as a default
   *
   * @param {string} taskId
   * @param {string} type
   * @param {number?} offset
   * @param {number?} limit
   * @returns {Promise<Array<FrameLocation>>}
   */
  getFrameLocations(taskId, type, offset = 0, limit = 1) {
    return this.$http({
      method: 'GET',
      url: this._apiService.getApiUrl(
        `/task/${taskId}/frameLocations/${type}`,
        {offset, limit}
      ),
    })
      .then(response => {
        return response.data.result;
      });
  }
}

TaskFrameLocationGateway.$inject = ['ApiService', '$http'];

export default TaskFrameLocationGateway;

/**
 * Service to interact with {@link Task} related {@link Frame}s
 */
export default class TaskFrameLocationService {
  /**
   * @param {angular.$http} $http
   */
  constructor($http) {
    this.$http = $http;
  }

  /**
   *
   * @param {string} taskId
   * @param {string} type
   * @param {number?} offset
   * @param {number?} length
   * @return {Promise<Array<FrameLocation>>}
   */
  getFrameLocations(taskId, type, offset = 0, length = 1) {
    const url = `/api/task/${taskId}/frameLocations/${type}`;
    const params = {offset, length};
    return this.$http({method: 'GET', url, params})
      .then(response => {
        return response.data.result;
      });
  }
}

TaskFrameLocationService.$inject = ['$http'];

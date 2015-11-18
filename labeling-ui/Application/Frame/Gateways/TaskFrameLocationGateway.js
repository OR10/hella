/**
 * Gateway to interact with {@link Task} related {@link Frame}s
 */
class TaskFrameLocationGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp injected
   * @param {$q} $q injected
   */
  constructor(apiService, bufferedHttp, $q) {
    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
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
   * @returns {AbortablePromise<Array<FrameLocation>>}
   */
  getFrameLocations(taskId, type, offset = 0, limit = 1) {
    return this._bufferedHttp({
      method: 'GET',
      url: this._apiService.getApiUrl(
        `/task/${taskId}/frameLocations/${type}`,
        {offset, limit}
      ),
    }, 'frameLocations')
    .then(response => {
      return response.data.result;
    });
  }
}

TaskFrameLocationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
];

export default TaskFrameLocationGateway;

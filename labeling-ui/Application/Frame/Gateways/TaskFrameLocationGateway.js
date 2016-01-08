import DataContainer from 'Application/LabelingData/Support/DataContainer';

/**
 * Gateway to interact with {@link Task} related {@link Frame}s
 */
class TaskFrameLocationGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp injected
   * @param {$q} $q injected
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor(apiService, bufferedHttp, $q, abortablePromiseFactory) {
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

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {DataContainer}
     * @private
     */
    this._cache = new DataContainer();
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
    const keys = this._getKeySet(type, offset, limit);

    if (this._cache.hasAll(keys)) {
      return this._abortablePromiseFactory(this._$q.resolve(this._cache.getAll(keys)));
    }

    return this._bufferedHttp({
      method: 'GET',
      url: this._apiService.getApiUrl(
        `/task/${taskId}/frameLocations/${type}`,
        {offset, limit}
      ),
    }, 'frameLocations')
    .then(response => {
      response.data.result.map(frameLocation => {
        this._cache.set(`${type}-${frameLocation.frameNumber}`, frameLocation);
      });

      return response.data.result;
    });
  }

  _getKeySet(type, offset, limit) {
    return new Array(limit).fill(null).map((ignored, index) => `${type}-${index + offset + 1}`);
  }
}

TaskFrameLocationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'abortablePromiseFactory',
];

export default TaskFrameLocationGateway;

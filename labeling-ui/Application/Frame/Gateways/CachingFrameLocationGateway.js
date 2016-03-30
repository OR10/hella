import FrameLocationGateway from './FrameLocationGateway';

/**
 * Gateway to interact with {@link Task} related {@link Frame}s, while caching responses
 */
class CachingFrameLocationGateway extends FrameLocationGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp injected
   * @param {$q} $q injected
   * @param {AbortablePromiseFactory} abortable
   * @param {CacheService} cache
   * @param {LoggerService} logger
   */
  constructor(apiService, bufferedHttp, $q, abortable, cache, logger) {
    super(apiService, bufferedHttp);

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortable = abortable;

    /**
     * @type {DataContainer}
     * @private
     */
    this._locationCache = cache.container('framelocation-by-frame');

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;
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
    const start = offset + 1;
    const end = start + limit - 1;
    const cacheKeys = this._generateLocationCacheKeysForRange(taskId, type, start, end);

    if (this._locationCache.hasAll(cacheKeys)) {
      const locations = this._locationCache.getAll(cacheKeys);
      this._logger.log('cache:frameLocation', `Cache Hit (getFrameLocations) {type: ${type}, start: ${start}, end: ${end}}`);
      return this._resolve(locations);
    }

    this._logger.log('cache:frameLocation', `Cache Miss (getFrameLocations) {type: ${type}, start: ${start}, end: ${end}}`);
    return super.getFrameLocations(taskId, type, offset, limit)
      .then(locations => {
        locations.forEach(
          location => this._locationCache.store(`${taskId}.${type}.${location.frameIndex}`, location)
        );
        return locations;
      });
  }

  /**
   * Generate framelocation-by-frame cache keys for a certain frame range
   *
   * @param {string} taskId
   * @param {string} type
   * @param {number} start
   * @param {number} end
   * @returns {Array.<string>}
   * @private
   */
  _generateLocationCacheKeysForRange(taskId, type, start, end) {
    const count = end - start + 1;
    const cacheKeys = new Array(count).fill(null).map(
      (_, index) => `${taskId}.${type}.${start + index}`
    );
    return cacheKeys;
  }

  /**
   * Directly resolve with an abortable promise
   *
   * @param {*} value
   * @returns {AbortablePromise}
   * @private
   */
  _resolve(value) {
    return this._abortable(this._$q.resolve(value));
  }
}

CachingFrameLocationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'abortablePromiseFactory',
  'cacheService',
  'loggerService',
];

export default CachingFrameLocationGateway;


/**
 * Gateway for retrieving {@link Video}s
 */
class VideoGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;
  }


  /**
   * Returns the {@link Video} with the given `id`
   *
   * @param {String} id
   *
   * @returns {AbortablePromise<Video|Error>}
   */
  getVideo(id) {
    const url = this._apiService.getApiUrl(
      `/v1/video/${id}`
    );
    return this._bufferedHttp.get(url, undefined, 'video')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading video');
      });
  }

  /**
   * Returns all {@link Video}s
   *
   * @returns {AbortablePromise<Video[]|Error>}
   */
  getVideos() {
    const url = this._apiService.getApiUrl(
      `/v1/video`
    );
    return this._bufferedHttp.get(url, undefined, 'video')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading videos');
      });
  }
}


VideoGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default VideoGateway;

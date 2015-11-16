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
   * @returns {Promise<Video|Error>}
   */
  getVideo(id) {
    const url = this._apiService.getApiUrl(
      `/video/${id}`
    );
    return this._bufferedHttp.get(url)
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
   * @returns {Promise<Video[]|Error>}
   */
  getVideos() {
    const url = this._apiService.getApiUrl(
      `/video`
    );
    return this._bufferedHttp.get(url)
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

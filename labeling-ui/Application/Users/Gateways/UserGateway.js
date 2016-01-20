/**
 * Gateway for managing User information
 */
class UserGateway {
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


}

UserGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default UserGateway;

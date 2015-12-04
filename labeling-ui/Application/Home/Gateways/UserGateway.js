import User from '../Models/User';

/**
 * Gateway for retrieving timer data
 */
class UserGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Gets the user for the given user id
   *
   * @return {AbortablePromise<User|Error>}
   */
  getCurrentUser() {
    const url = this._apiService.getApiUrl('/user/profile');
    return this._bufferedHttp.get(url, undefined, 'profile')
      .then(response => {
        if (response.data && response.data.result) {
          return new User(response.data.result);
        }

        throw new Error('Failed loading user');
      });
  }
}

UserGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default UserGateway;

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

  /**
   * List all users from the backend
   *
   * @return {AbortablePromise.<Array.<User>>}
   */
  getUsers() {
    const url = this._apiService.getApiUrl('/users');
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.users) {
          throw new Error('Failed loading users list');
        }

        return response.data.result.users;
      });
  }

  /**
   * Get a specific user by his/her id
   *
   * @param {string} id
   *
   * @return {AbortablePromise.<User>}
   */
  getUser(id) {
    const url = this._apiService.getApiUrl(`/users/${id}`);
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.user) {
          throw new Error(`Failed loading user with id ${id}.`);
        }

        return response.data.result.user;
      });
  }

  /**
   * Get a specific user by his/her id
   *
   * @param {User} user
   *
   * @return {AbortablePromise.<User>}
   */
  createUser(user) {
    const url = this._apiService.getApiUrl(`/users`);
    return this._bufferedHttp.post(url, user, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed creating user ${user.id}`);
        }

        return response.data.result.success;
      });
  }

  /**
   * Update a specific user
   *
   * @param {User} user
   *
   * @return {AbortablePromise.<User>}
   */
  updateUser(user) {
    const url = this._apiService.getApiUrl(`/users/${user.id}`);
    return this._bufferedHttp.put(url, user, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed creating user ${user.id}`);
        }

        return response.data.result.success;
      });
  }

  /**
   * Delete a user using his/her id
   *
   * @param {string} id
   *
   * @return {AbortablePromise.<User>}
   */
  deleteUser(id) {
    const url = this._apiService.getApiUrl(`/users/${id}`);
    return this._bufferedHttp.delete(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed deleting user with id ${id}`);
        }

        return response.data.result.success;
      });
  }
}

UserGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default UserGateway;

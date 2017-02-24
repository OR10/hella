import User from '../Models/User';
import Organisation from '../../Organisation/Models/Organisation';
import {map} from 'lodash';

/**
 * Gateway for managing User information
 */
class UserGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, organisationService) {
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

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;
  }

  /**
   * Gets the currently loggedIn user
   *
   * @return {AbortablePromise<User|Error>}
   */
  getCurrentUser() {
    const url = this._apiService.getApiUrl('/currentUser/profile');
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (response.data && response.data.result) {
          return new User(response.data.result);
        }

        throw new Error('Failed loading currently logged in user');
      });
  }

  /**
   * List all users of the current organisation
   *
   * @return {AbortablePromise.<Array.<User>>}
   */
  getUsers() {
    const organisationId = this._organisationService.get().id;
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/user`);

    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.users) {
          throw new Error('Failed loading users list');
        }

        return response.data.result.users.map(user => new User(user));
      });
  }

  /**
   * List all users of all organisations
   *
   * @return {AbortablePromise}
   */
  getUserOfAllOrganisations() {
    const url = this._apiService.getApiUrl(`/user`);

    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.users) {
          throw new Error('Failed loading users list');
        }

        return response.data.result.users.map(user => new User(user));
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
    const url = this._apiService.getApiUrl(`/user/${id}`);
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.user) {
          throw new Error(`Failed loading user with id ${id}.`);
        }

        return new User(response.data.result.user);
      });
  }

  /**
   * Create a new User as addition to the database
   *
   * @param {User} user
   *
   * @return {AbortablePromise.<User>}
   */
  createUser(user) {
    const url = this._apiService.getApiUrl(`/user`);
    return this._bufferedHttp.post(url, user, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.user) {
          throw new Error(`Failed creating user ${user.id}`);
        }

        return new User(response.data.result.user);
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
    const url = this._apiService.getApiUrl(`/user/${user.id}`);
    return this._bufferedHttp.put(url, user, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.user) {
          throw new Error(`Failed updating user ${user.id}`);
        }

        return new User(response.data.result.user);
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
    const url = this._apiService.getApiUrl(`/user/${id}`);
    return this._bufferedHttp.delete(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed deleting user with id ${id}`);
        }

        return response.data.result.success;
      });
  }

  /**
   * Set a new passwort for the current user
   *
   * @param password
   * @returns {AbortablePromise}
   */
  setCurrentUserPassword(oldPassword, newPassword) {
    const url = this._apiService.getApiUrl(`/currentUser/password`);
    const data = {
      oldPassword: oldPassword,
      newPassword: newPassword,
    };
    return this._bufferedHttp.put(url, data, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed setting password`);
        }

        return response.data.result.success;
      }).catch(() => {
        return false;
      });
  }

  /**
   * Return the users persmissions
   *
   * @returns {AbortablePromise}
   */
  getCurrentUserPermissions() {
    const url = this._apiService.getApiUrl(`/currentUser/permissions`);
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result) {
          throw new Error('Invalid permission list response');
        }

        return response.data.result;
      });
  }

  /**
   * Retrieve the list of organisations the current user is assigned to
   *
   * @returns {AbortablePromise.<Array.<Organisation>>}
   */
  getCurrentUserOrganisations() {
    const url = this._apiService.getApiUrl(`/currentUser/organisations`);
    return this._bufferedHttp.get(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !Array.isArray(response.data.result)) {
          throw new Error('Invalid organisation list response');
        }

        const organisationDocumentsById = response.data.result;
        return map(
          organisationDocumentsById,
          organisationDocument => new Organisation(
            organisationDocument.id,
            organisationDocument.name,
            organisationDocument.quota
          )
        );
      });
  }
}

UserGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  'organisationService',
];

export default UserGateway;

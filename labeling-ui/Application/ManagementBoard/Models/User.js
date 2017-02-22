import {cloneDeep} from 'lodash';

/**
 * Model for a User
 */
class User {
  /**
   * @param {{username: string, id: string, email: string, enabled: bool, lastLogin: string, locked: bool, roles: Array.<string>}} user
   */
  constructor(user) {
    // Required properties

    /**
     * Id of the user
     *
     * @type {string}
     */
    this.id = user.id;
    /**
     * Username of the user
     *
     * @type {string}
     */
    this.username = user.username;

    /**
     * Mail address of the user
     *
     * @type {string}
     */
    this.email = user.email;

    /**
     * @type {bool}
     */
    this.enabled = user.enabled;

    /**
     * @type {string}
     */
    this.lastLogin = user.lastLogin;

    /**
     * @type {true}
     */
    this.locked = user.locked;

    /**
     * @type {Array.<string>}
     */
    this.roles = user.roles;

    /**
     * @type {string}
     */
    this.password = null;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {id, username, email, enabled, lastLogin, locked, roles, password} = this;
    return {
      roles: cloneDeep(roles),
      id, username, email, enabled, lastLogin, locked, password,
    };
  }
}

export default User;

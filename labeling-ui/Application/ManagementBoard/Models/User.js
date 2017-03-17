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

    /**
     * @type {bool}
     */
    this.expired = user.expired;

    /**
     * @type {string}
     */
    this.expiresAt = user.expiresAt ? new Date(user.expiresAt) : null;

    /**
     * @type {Array.<Organisation>}
     */
    this.organisations = user.organisations || [];
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {id, username, email, enabled, lastLogin, locked, roles, password, expired, expiresAt} = this;
    const organisationIds = this.organisations.map(organisation => organisation.id);

    return {
      roles: cloneDeep(roles),
      id, username, email, enabled, lastLogin, locked, password, expired, expiresAt, organisationIds,
    };
  }
}

export default User;

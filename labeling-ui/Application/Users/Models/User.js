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
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {id, username, email, enabled, lastLogin, locked, roles} = this;
    return {id, username, email, enabled, lastLogin, locked, roles};
  }
}

export default User;

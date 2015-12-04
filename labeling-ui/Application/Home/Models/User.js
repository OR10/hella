/**
 * Model for a User
 */
class User {
  /**
   * @param {{username: string}} user
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
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    return {id, username, email};
  }
}

export default User;

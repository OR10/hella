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
     * Username of the user
     *
     * @type {string}
     */
    this.username = user.username;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    return {username};
  }
}

export default User;
